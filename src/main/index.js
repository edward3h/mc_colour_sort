import { promises as fs } from "fs";
import { head, unzip, isString, isArray, uniq } from "lodash";

const loadJson = async (filename) => {
  const fileContents = await fs.readFile(filename);
  return JSON.parse(fileContents);
};

const filterBlock = (name) => {
  if (
    /slab|stair|door|button|_plate|wall|fence|sign|command_block/.test(name)
  ) {
    return false;
  }
  return true;
};

(async () => {
  const blockDef = await loadJson("packs/resources/blocks.json");
  const terrainDef = await loadJson(
    "packs/resources/textures/terrain_texture.json"
  );
  const blocksColours = [];
  Object.keys(blockDef)
    .filter(filterBlock)
    .forEach((name) => {
      const def = blockDef[name];
      if (!def || !def.textures) {
        return;
      }
      let textures;
      if (isString(def.textures)) {
        textures = [def.textures];
      } else {
        textures = Object.values(def.textures);
      }
      textures = textures.map((t) => terrainDef.texture_data[t]?.textures);
      let myBlock;
      if (isArray(head(textures))) {
        // multi-texture block like stone or log
        textures = unzip(textures); // transpose order
        for (let i = 0; i < textures.length; i++) {
          myBlock = { name, data_id: i, textures: uniq(textures[i]) };
          blocksColours.push(myBlock);
        }
      } else {
        // single texture block
        myBlock = { name, textures: uniq(textures) };
        blocksColours.push(myBlock);
      }
    });

  console.log(blocksColours);
})();
