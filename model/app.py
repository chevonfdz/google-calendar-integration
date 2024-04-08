# # app.py
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import joblib
# import numpy as np
# import tensorflow as tf
# from tensorflow.keras.models import load_model
# from tensorflow.keras.initializers import Orthogonal

# print("TensorFlow version:", tf.__version__)

# app = Flask(__name__)
# CORS(app)

# # Replace these paths with the actual paths to your model and scaler
# MODEL_PATH = 'LSTM_Models/best_lstm_model.h5'
# SCALER_PATH = 'LSTM_Models/scaler_X.pkl'

# # Specify custom objects if any were used in the model, like specific initializers
# custom_objects = {
#     'Orthogonal': Orthogonal(gain=1.0, seed=None),
# }
# # Load the trained LSTM model with custom objects and scaler
# # model_path = 'path/to/your/model.h5'
# model = load_model(MODEL_PATH, custom_objects=custom_objects)
# scaler = joblib.load(SCALER_PATH)

# # Predict function that takes input data and returns predicted study time
# def predict_study_time(input_data):
#     # Preprocess the input data: Extract and scale features
#     features = np.array([[input_data['Difficulty Level'],
#                           input_data['Previous Mark'],
#                           input_data['Latest Mark'],
#                           input_data['Date Count']]])
#     scaled_features = scaler.transform(features)

#     # Prepare the scaled features for LSTM (assuming time_steps = 3)
#     time_steps = 3
#     num_features = scaled_features.shape[1]
#     scaled_features = np.repeat(scaled_features, time_steps, axis=0).reshape(1, time_steps, num_features)

#     # Make prediction
#     predicted_study_time = model.predict(scaled_features)
#     return predicted_study_time[0][0]

# @app.route('/predict', methods=['POST'])
# def predict():
#     # Get input data from the POST request
#     input_data = request.get_json()
    
#     # Use the predict_study_time function to get the prediction
#     predicted_time = predict_study_time(input_data)
    
#     # Return the prediction in JSON format
#     return jsonify({"predicted_study_time": predicted_time})

# if __name__ == '__main__':
#     app.run(debug=True)


# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    # Extract the student details from the request payload
    input_data = request.get_json()

    # Example of extracting relevant parts of the input_data
    # Assuming input_data contains 'subjects' as a list of subjects the student is studying
    subjects = input_data.get('subjects', [])

    # Simulate predicting study times by assigning random durations between 30 to 60 minutes for each subject
    study_times = {subject: random.randint(30, 60) for subject in subjects}

    # Return the subjects with their respective predicted study times
    return jsonify(study_times)

if __name__ == '__main__':
    app.run(debug=True)

