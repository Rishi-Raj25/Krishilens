from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import onnxruntime as ort
import os
import io

app = Flask(__name__, 
            static_folder='../web', 
            template_folder='../web')
CORS(app)

# ---------------------------------------------------------------------------
# Frontend Routes
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return send_from_directory('../web', 'index.html')

@app.route('/<path:path>')
def serve_web(path):
    return send_from_directory('../web', path)

# ---------------------------------------------------------------------------
# ML Model Setup (ONNX Runtime — lightweight, no PyTorch needed)
# ---------------------------------------------------------------------------

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model.onnx')

# Load ONNX model session once at startup
try:
    ort_session = ort.InferenceSession(MODEL_PATH)
    print(f"[OK] ONNX model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Could not load model: {e}")
    ort_session = None

# ImageNet class labels (top-level, we map to breed names)
IMAGENET_CLASSES = None
try:
    import json
    labels_path = os.path.join(os.path.dirname(__file__), '..', 'imagenet_classes.json')
    if os.path.exists(labels_path):
        with open(labels_path) as f:
            IMAGENET_CLASSES = json.load(f)
except:
    pass

BREED_INFO = {
    "Gir Cow": [
        "Famous Indian dairy breed native to Gujarat",
        "Known for exceptionally high milk yield",
        "Highly resilient in hot and harsh climates",
        "Recognizable by its prominent, majestic forehead"
    ],
    "Murrah Buffalo": [
        "Often referred to as the 'Black Gold' of India",
        "Famous for very high milk yield and rich fat content",
        "Highly adaptable to various environmental conditions",
        "Recognizable by tightly curved horns"
    ],
    "Sahiwal Cow": [
        "One of the best dairy breeds in the subcontinent",
        "Known for high fat content in milk",
        "Strong natural resistance to ticks and parasites",
        "Distinct reddish-brown coat color"
    ],
    "Red Sindhi": [
        "Hardy breed originating from the Sindh region",
        "Excellent for milk production in tropical climates",
        "Highly resistant to heat and diseases",
        "Distinctive deep red coat"
    ],
    "Unknown": [
        "Bovine detected, but breed is unclear",
        "Try uploading a clearer or different angle photo",
        "Ensure the animal fills the majority of the frame"
    ]
}

# Map ImageNet predictions to cattle breeds
CATTLE_KEYWORDS = {
    "ox": "Gir Cow",
    "water buffalo": "Murrah Buffalo",
    "buffalo": "Murrah Buffalo",
    "bull": "Sahiwal Cow",
    "cow": "Gir Cow",
    "dairy": "Sahiwal Cow",
    "cattle": "Red Sindhi",
    "brahman": "Gir Cow",
    "zebu": "Red Sindhi",
}

def preprocess_image(image_bytes):
    """Preprocess image for MobileNetV2 ONNX model."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    
    # Convert to numpy array and normalize
    img_array = np.array(img, dtype=np.float32) / 255.0
    
    # ImageNet normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std
    
    # HWC -> CHW -> NCHW
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def map_to_breed(class_name):
    """Map an ImageNet class name to a cattle breed."""
    class_lower = class_name.lower()
    for keyword, breed in CATTLE_KEYWORDS.items():
        if keyword in class_lower:
            return breed
    return "Unknown"

# ---------------------------------------------------------------------------
# Prediction API
# ---------------------------------------------------------------------------

@app.route('/api/predict-breed', methods=['POST'])
def predict_breed():
    if ort_session is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    try:
        image_bytes = file.read()
        input_tensor = preprocess_image(image_bytes)
        
        # Run inference
        input_name = ort_session.get_inputs()[0].name
        outputs = ort_session.run(None, {input_name: input_tensor})
        
        # Get prediction
        predictions = outputs[0][0]
        
        # Apply softmax
        exp_preds = np.exp(predictions - np.max(predictions))
        probabilities = exp_preds / exp_preds.sum()
        
        top_idx = np.argmax(probabilities)
        confidence = float(probabilities[top_idx]) * 100
        
        # Get ImageNet class name
        if IMAGENET_CLASSES and str(top_idx) in IMAGENET_CLASSES:
            class_name = IMAGENET_CLASSES[str(top_idx)]
        else:
            class_name = f"class_{top_idx}"
        
        # Map to breed
        breed = map_to_breed(class_name)
        description = BREED_INFO.get(breed, BREED_INFO["Unknown"])
        
        return jsonify({
            "breed": breed,
            "confidence": round(confidence, 2),
            "description": description,
            "imagenet_class": class_name
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True, port=5001)
