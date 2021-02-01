import pickle

with open("data/otstandings.pickle", "rb") as f:
    standings = pickle.load(f)

# standings[742845693785276576][349573204118994945] += 1 # Fill in guild and user id as needed

with open("data/otstandings.pickle", "wb") as f:
    pickle.dump(standings, f)
