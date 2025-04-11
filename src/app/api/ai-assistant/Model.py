from flask import Flask, request, jsonify
from deepseek import DeepSeekModel  # Hypothetical import

app = Flask(__name__)
model = DeepSeekModel.load("path/to/your/model")


@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    response = model.generate(
        data["prompt"],
        max_length=data.get("max_length", 150),
        temperature=data.get("temperature", 0.7),
    )
    return jsonify({"text": response})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
