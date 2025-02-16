// add functionallity for swiss tournament type

// create proceed to next round button

// create a function that will calculate the next round based on the current round and the players scores

// scoring system:
// 1. Matchpoints: 2 for a win, 1.5 for a draw, 1 for a loss if the player has scored at least 11 scorepoints in the match, otherwise 0
// 2. Scorepoints: The first player to reach 21 points wins the game
// 3. Bye: 2 matchpoints and 21 scorepoints
// 4. Results is ordered by matchpoints, then scorepoints
// 5. I case of a tie, the player with the most wins is ranked higher
// 6. If still a tie, the player with the most points scored in a single match is ranked higher
// 7. If still a tie, mutual match result is used
// 8. If still a tie, the player with the highest seed is ranked higher

// general scoring rules (applies to all tournament types):
// The first player to reach 21 points wins the game. It is not needed to win by 2 points.
// 1. A win is worth 2 matchpoints
// 2. A draw is worth 1.5 matchpoints
// 3. A loss is worth 1 matchpoint if the player has scored at least 11 scorepoints in the match, otherwise 0 matchpoints
// 4. A bye (or walkover) is worth 2 matchpoints and 21 scorepoints

// rules for swiss tournament:
// 1. Competitors meet one-on-one in each round and are paired using a set of rules designed to ensure that each competitor plays opponents 
// with a similar running score (except in the first round, which is random or seeded).
// 2. No player is paired against the same opponent twice.
// 3. If there is an odd number of players, one player is given a bye, which counts as a win. Players cannot receive more than one bye in a tournament.



