import os, json
path = os.path.dirname(os.path.realpath(__file__))
with open(path + "../config.json", "r") as f:
    config = json.load(f)
