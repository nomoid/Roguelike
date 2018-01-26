# Design Doc for Weed Strike

### Goals

**Legend of J** is a fairly standard, simple [Roguelike](https://en.wikipedia.org/wiki/Roguelike) game. As such, the player gets
* character advancement/progression (on the mechanics side of things, not necessarily the story side)
  * some opponents that are too challenging to fight in the early stages of the game are easy to beat by the later stages of the game
* inventory management
* primary mob interactions are combat ('attack it' is almost never a bad choice from a story standpoint)
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
    * The possible results are:
      * Major failure
      * Minor failure
      * Minor success
      * Major success
    * e.g. Shooting a bow
      * Major failure
        * Chance you injure yourself
        * Chance of bow breaking
      * Minor failure
        * You miss the target
      * Minor success
        * You hit the target
      * Major success
        * You get a critical hit
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
* In depth skill system
  * Skills allow character to perform new action and get better at their existing abilities
  * Skills are unlocked by getting sufficient **Skill XP** in that particular skill
  * **Skill XP** is gained in various ways
    * Training the skill/doing things related to the skill
      * Training earns **Skill XP** faster
      * e.g. Level 0 gives 1x earnings, Level 1 gives 2x earnings, Level 2 gives 3x earnings, etc.
      * This encourages people to spend **Skill points** to unlock more unique skills instead
    * Spending **Skill points** on unlocking the skill
      * **Skill points** are gained by killing enemies or leveling up
      * **Skill points** can only be spent to unlock full levels
    * Reading a **Skill tome** (generally gives enough to unlock level 1 of the skill)
      * **Skill tomes** can sometimes bypass unlocking restrictions
      * **Skill tomes** are very rare, and there may be skills that can be unlocked only by **Skill tomes**?
  * When you max out a skill, you can skill gain **Skill XP** for that skill. This **Skill XP** is converted 0.1x to your **Skill points**?
    * Perhaps the more **Skill XP** you have, the fewer **Skill points** each is worth
  * Example skill
    * Archery has 5 levels (Archery 1 to Archery 5)
      * Archery 1 allows the user to use bows
      * Each additional level of Archery allows the user to use better bows, and improves Archery success rate and bow damage
    * Archery requires the Athletics skill (you must have that skill to unlock the Archery skill, but not to get Archery XP) AND 15 dexterity (AND vs OR?)
    * Archery 1 is earned by reaching 100 Archery XP
      * Archery 2 is earned by reaching 400 Archery XP, etc.
      * Archery 5 is earned by reaching 25600 Archery XP
    * You get Archery XP by doing things related to Archery
      * You get 1 Archery XP for throwing an object and damaging an enemy
      * You get 2 Archery XP for using a sling and damaging an enemy
      * You get 3 Archery XP for using a bow and damaging an enemy
      * You get 5 Archery XP for killing an enemy with a thrown object or a sling
      * You get 10 Archery XP for killing an enemy with a bow
      * On hit XP is doubled for critical hits
    * Archery allows for the unlocking of the skills Sharpshooter (Increases ranged critical hit chance, allows you to use Scopes) and Steady Aim (Increases ranged hit chance, decreases the ranged shooting penalty after getting hit)
* Combat
  * Combat is identical for the player and for enemies
  * Each entity has a certain number of hit points
    * When an entity runs out of hitpoints, it dies
  * An attack is performed by rolling dice
    * The dice roll determines whether the attack is a major failure, minor failure, minor success, or major success
      * Each type of weapon has a set dice for determining success/failure
        * Note this is not the amount of damage dealt!
        * See weapon_list.md for list of weapons and their dice
      * Each level in a skill increases the number of dice being rolled
    * If the attack succeeds, the opponent performs both a dodge roll and a block roll
    * If the dodge succeeds, the attack misses, but the next dodge roll is penalized; this penalty stacks up (to prevent perma-dodging)
    * If the dodge fails, the  opponent performs a block roll
      * The block roll can block some or all of the damage
    * The heavier the armor, the less likely dodge succeeds, but the more damage is blocked, so it's a trade off

* Lighting
  * Player FOV radius changes based on the ambient light on a floor
  * Torches held can increase FOV radius
    * Torches on the floor can create a "beacon" of viewable spaces
  * Potion/Spell of clairvoyance can increase radius or make entire floor actively visible
  * Some scroll can reveal entire map to memory before exploring, but you know nothing about entities or loot

### Wishes
* Different towers to warp between
  * four elemental towers
    * beat each one, or, pick which one best suits your character build, or a mixed route down all four
* RNG seeding system allowing the player to play the same map more than once, or even to replay previous playthroughs?
