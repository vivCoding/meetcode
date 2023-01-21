const emojis = require("./src/constants/emoji_pretty.json")
const EmojiConverter = require("emoji-js")
const fs = require("fs")

const emojiConverter = new EmojiConverter()
emojiConverter.replace_mode = "unified"

const x = {}
const bad = {}

emojis.forEach((emoji) => {
  emoji.short_names.forEach((name) => {
    x[name] = String.fromCodePoint(parseInt(emoji.unified, 16))
  })
})

try {
  const data = JSON.stringify(x, null, 2)
  fs.writeFileSync("./src/constants/emojis.json", data, "utf-8")
  // const badData = JSON.stringify(bad, null, 2)
  // fs.writeFileSync("bad_emojis.json", badData, "utf-8")
  console.log("Done")
} catch (e) {
  console.log("Error writing file:", e)
}
