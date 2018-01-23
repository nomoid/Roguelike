* Item Types
  * type: string
  * weight: int (grams)
  * description: string
  * Consumables
    * Food
      * satiation: int
      * effect: effect
      * buff: buff
    * Potions - affects only drinker
      * effect: effect
      * buff: buff
    * Scrolls - affects environment/all characters/all enemies
      * scrollType: string
      * scrollPower: int
    * Tomes
      * Skill Tomes
        * skillName: string
        * skillXP: int
  * Equipment
    * Weapons
      * One-Handed
      * Two-Handed
      * Consumable Weapons
    * Armor
      * Helmet
      * Armor
      * Pants
      * Boots
      * Gauntlets
      * Greaves?
      * Braces?
    * Torches?
  * Materials?
    * Minerals
    * Crafting Ingredients
    * Alchemy Ingredients
    * Cooking Ingredients
* Effects
  * type: string
  * Instant Heal
    * hp: int
    * "Instantly heal for ${hp} HP"
  * Cure Poison
    * "Instantly cure poison"
* Buffs
  * type: string
  * duration: int
  * HP Regeneration
    * hpPerSec: int
    * "Increases HP regeneration by ${hpPerSec} HP per second."
