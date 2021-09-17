LEADERBOARD_FP = 'res/leaderboard.txt'
D2_MANAGERS_FP = 'res/d2_managers.txt'
D3_MANAGERS_FP = 'res/d3_managers.txt'
D4_MANAGERS_FP = 'res/d4_managers.txt'
# This is the number of fill candidates to display, for each div
NUM_FILLS_TO_DISPLAY = 20


def load_manager_data():
  # Map usernames to objects of manager data (e.g. PF, team name)
  manager_data = {}
  with open(LEADERBOARD_FP, 'r') as reader:
    headers = []
    for row in reader:
      row = row.strip().split('\t')
      if not headers:
        headers = row
      else:
        row_data = {}
        for i in range(len(headers)):
          row_data[headers[i]] = row[i].lower()
        manager_data[row_data['user'].lower()] = row_data
  return manager_data


def get_fill_list_for_div(div_managers_fp):
  fills = []
  with open(div_managers_fp, 'r') as reader:
    for row in reader:
      username = row.strip().split()[0].lower()
      # Assume username is in manager_data (clean typos offline beforehand)
      fills.append({ 'user': username, 'pf': float(manager_data[username]['pf'])})
  return sorted(fills, key=lambda x: x['pf'], reverse=True)


if __name__ == '__main__':
  manager_data = load_manager_data()
  # Get list of all upcoming D4 managers, along with their PF
  d1_fills = get_fill_list_for_div(D2_MANAGERS_FP)
  d2_fills = get_fill_list_for_div(D3_MANAGERS_FP)
  d3_fills = get_fill_list_for_div(D4_MANAGERS_FP)

  for tup in [('D1', d1_fills), ('D2', d2_fills), ('D3', d3_fills)]:
    print('\n-----\n{} Fills:'.format(tup[0]))
    for i in range(min(len(tup[1]), NUM_FILLS_TO_DISPLAY)):
      print('  {} - {}'.format(tup[1][i]['user'], tup[1][i]['pf']))
