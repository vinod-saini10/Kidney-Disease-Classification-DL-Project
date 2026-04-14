import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os

class PredictionPipeline:
    def __init__(self, filename):
        self.filename = filename

    def predict(self):
        # Load the actual trained model from artifacts
        model_path = os.path.join("artifacts", "training", "model.h5")
        if not os.path.exists(model_path):
            # Fallback only if artifacts are missing, but prioritized correctly now
            model_path = os.path.join("model", "model.h5")
            
        model = load_model(model_path)

        # Preprocess image
        imagename = self.filename
        test_image = load_img(imagename, target_size=(224, 224))
        test_image = img_to_array(test_image)
        test_image = test_image / 255.0  # normalize
        test_image = np.expand_dims(test_image, axis=0)

        # Predict
        result = model.predict(test_image)
        print("Model output:", result)

        # Interpret prediction
        confidence = float(result[0][0])
        if confidence > 0.5:
            prediction = 'Normal'
        else:
            prediction = 'Tumor'
            confidence = 1 - confidence # Make confidence representative for Tumor

        return [{
            "result": prediction,
            "confidence": confidence
        }]
