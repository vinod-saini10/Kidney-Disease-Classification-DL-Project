import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os

class PredictionPipeline:
    def __init__(self, filename):
        self.filename = filename

    def predict(self):
        # Load model
        model = load_model(os.path.join("artifacts", "training", "model.h5"))

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
        if result[0][0] > 0.5:
            prediction = 'Normal'
        else:
            prediction = 'Tumor'

        return [{"your image have": prediction}]
