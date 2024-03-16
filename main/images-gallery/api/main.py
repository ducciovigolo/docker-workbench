import os
import requests
import pymongo
from bson.json_util import dumps
from flask import Flask, request
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv(dotenv_path="./.env.local")

UNSPLASH_URL = "https://api.unsplash.com/photos/random"
UNSPLASH_KEY = os.environ.get("UNSPLASH_KEY", "")

CONFIG_MONGODB_SERVER = os.environ.get("CONFIG_MONGODB_SERVER","")
CONFIG_MONGODB_ADMINUSERNAME = os.environ.get("CONFIG_MONGODB_ADMINUSERNAME","")
CONFIG_MONGODB_ADMINPASSWORD = os.environ.get("CONFIG_MONGODB_ADMINPASSWORD","")

DEBUG = bool(os.environ.get("DEBUG", True))

if not UNSPLASH_KEY:
    raise EnvironmentError(
        "Please provide UNSPLASH_KEY, for instance creating .env.local file and inserting there UNSPLASH_KEY"
    )

app = Flask(__name__)
CORS(app)

app.config["DEBUG"] = DEBUG

app.db = pymongo.MongoClient(CONFIG_MONGODB_SERVER, 
                             username=CONFIG_MONGODB_ADMINUSERNAME, 
                             password=CONFIG_MONGODB_ADMINPASSWORD)\
                                 ['images-gallery']

@app.route("/random-image")
def new_image():
    word = request.args.get("query")
    headers = {"Accept-Version": "v1", "Authorization": "Client-ID " + UNSPLASH_KEY}
    params = {"query": word}
    response = requests.get(url=UNSPLASH_URL, headers=headers, params=params, verify=False)

    data = response.json()
    return data

@app.route("/images")
def load_images():
    images = app.db.images.find()
    data = dumps(list(images))
    return data

@app.route("/images/<id>", methods=['DELETE'])
def del_image(id):
    image = app.db.images.delete_one({'id': id})
    return dumps(id), 200

@app.route("/images", methods=['POST'])
def put_image():
    if not request.json:
        abort(400)
    inserted_id = app.db.images.insert_one(request.json).inserted_id
    return dumps(inserted_id), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
