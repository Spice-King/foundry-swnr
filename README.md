# Stars Without Number: Revised

_The year is 3200 and mankind's empire lies in ashes._

_The Jump Gates fell six hundred years ago, severing the links between the myriad worlds of the human diaspora._

_Now, the long isolation of the Silence falls away as men and women return to the skies above their scattered worlds._

_Will you be among them once more?_

## Features

* Player characters
* Weapons and items
* Psionic powers and foci

## Dev crash course

1. `npm install`
2. Copy `foundryconfig.example.json` to `foundryconfig.json` and make edits if you want a different dataPath for working from.
3. `npm run build:watch`
4. `npm run foundry` in a second terminal if you stuff a copy of Foundry into `./foundry` and want to use `./data` as your dataPath

### Special dev features

I've done some weird/unique things to this systems, and more are set to come.

* Avoiding Javascript for Typescript for better type sanity
* Since JSON it down right picky, I compile YAML into JSON
* The NeDB files are a pain for diffs, between compaction and the append only nature which scrambles the lines around, so I make them as well from a folder of YAML files.

## The todo list

- Class power support
- Ships
- Vehicles
- Copies of all the roll tables
- Mods
- Factions and Faction Assets
- Deluxe Rules support, sans content:
  - Mechs
  - True Ai
  - Transhumans

## Licence

This system is licensed under AGLP-3.0.

TL;DR: You mod it and share it, you send the changes. No ifs, ands, or butts.

The contents of `src/packs/` are mostly text from [SWN Revised Edition (Free Version)](https://www.drivethrurpg.com/product/230009/Stars-Without-Number-Revised-Edition-Free-Version) with slight alterations to better fit with Foundry VTT. All rights for the included content belong wto Kevin Crawford. I've followed what Kevin Crawford has said on Reddit. [[1]](https://www.reddit.com/r/SWN/comments/8g9lsp/is_there_a_standing_policy_on_selling_content/dy9vf8q/) [[2]](https://www.reddit.com/r/SWN/comments/cj1b7n/could_someone_explain_how_ogl_works_with_regards/)

The contents of `src/assets/icons/game-icons.net` are [Kevlar vest icon by Skoll](https://game-icons.net/1x1/skoll/kevlar-vest.html), [Cyber eye icon by Delapouite](https://game-icons.net/1x1/delapouite/cyber-eye.html), [Swap bag icon by Lorc](https://game-icons.net/1x1/lorc/swap-bag.html) and [Saber and pistol icon by Delapouite](https://game-icons.net/1x1/delapouite/saber-and-pistol.html) licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)


## Abandonment

TBD. I'll figure out the exact wording and times later, but I do want to make a proper note about it, since I'm aware that modules and systems not getting updates is a bad time for all users.
