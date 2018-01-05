# Design Doc for Weed Strike

### Goals

_____ is a fairly standard, simple roguelike. As such, the player gets
* character advancement/progression (on the mechanics side of things, not necessarily the story side)
  * some opponents that are too challenging to fight in the early stages of the game are easy to beat by the later stages of the game
* inventory management
* primary mob interactions are combat ('attack it' is never a bad choice from a story standpoint)
  * some tactically interesting combat
* exploration (of procedurally generated content)
* a simple framing story to engage the player and justify the avatar actions, but nothing too deep and little in the way of narrative progression
* a final battle/goal
* other standard roguelike experiences (permadeath, turn-based action, etc.)

### Story

You find yourself in the top of a tower, and you need to get down. The tower is standing in an abyss, you can't see land out the window.
The tower is perilous and falling apart and it appears easy to fall off the sides or through the floor.
You see very powerful monsters outside the tower in the distance and hear more on the floors below you.
You need to make your way down the tower safely, combating the monsters you come across. Hopefully there is a way to escape at the bottom.




### Mechanics
* Each floor has an inside area and an outside balcony area
  * inside area is safer
    * can only fall through occasional traps or holes in floor
    * contains decent loot, appropriate monsters, and stairs to next floor
  * outside area is harder
    * can fall off edges or holes
    * dark beings from the abyss are harder to fight
      * they drop good loot though
  * doors between outside and inside mean player can take either route or a mixed route through the floor
* Dice roll based mechanics
  * You have skills that determine how many dice you roll on certain actions
  * You must roll above a value for something to happen
    * Major failure
    * Minor failure
    * Minor success
    * Major success
* Knockback is a component of combat
  * knockback checks for your attacks
    * different weapons have different knockback rolls
    * i.e. most spells wouldnt have much knockback chance
    * sheilds to protect from it
  * enemies also can knock you back
    * different enemies have deal different knockback and get knocked back at different rates
  * because the map is perilous, can accidentally fall off edge of balcony outside or fall through floor anywhere
  * can fall one floor down
    * take fall damage, but you've progressed. Maybe no way to get back up.
      * maybe youve missed good loot or level grinding, but this could be a viable option for progression if player is risky

### Wishes
* Different towers to warp between
  * four elemental towers
    * beat each one, or, pick which one best suits your character build, or a mixed route down all four
