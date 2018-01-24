* Item Types
  * \[d\]: Drop
  * \[t\]: Trash
  * type: string
  * weight: int (grams)
  * description: string
  * Consumables
    * Food
      * \[c\]: Eat
      * satiation: int
      * effect: effect
      * buff: buff
    * Potions - affects only drinker
      * \[c\]: Drink
      * effect: effect
      * buff: buff
    * Scrolls - affects environment/all characters/all enemies
      * \[c\]: Read
      * scrollType: string
      * scrollPower: int
    * Tomes
      * \[c\]: Read
      * Skill Tomes
        * skillName: string
        * skillXP: int
  * Equipment
    * \[e\]: Equip
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
  * name: string
  * Instant Heal
    * effect.hpAmount: int
    * "Instantly heal for ${this.effect.hpAmount} HP"
  * Cure Poison
    * "Instantly cure poison"
* Buffs
  * name: string
  * duration: int
  * frequency: int
  * HP Regeneration
    * effect.hpAmount: int
    * "Regenerates ${this.effect.hpAmount} HP every ${this.frequency} turns."
  * Lifelink
    * effect.hpAmount: int
    * "Regenerates ${this.effect.hpAmount} HP every time you kill an enemy."
