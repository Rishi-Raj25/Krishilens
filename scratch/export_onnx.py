import torch
import torchvision.models as models

def export_model():
    # Load the same model used in app.py
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    model.eval()

    # Create dummy input
    dummy_input = torch.randn(1, 3, 224, 224)

    # Export to ONNX using the legacy exporter (more reliable)
    torch.onnx.export(model, 
                      dummy_input, 
                      "model.onnx", 
                      export_params=True, 
                      opset_version=18, 
                      do_constant_folding=True, 
                      input_names=['input'], 
                      output_names=['output'],
                      dynamo=False)
    
    import os
    size_mb = os.path.getsize("model.onnx") / (1024 * 1024)
    print(f"Model exported to model.onnx ({size_mb:.1f} MB)")

if __name__ == "__main__":
    export_model()
