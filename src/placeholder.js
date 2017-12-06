export class Placeholder
{
  constructor(key){
    this.key = key
    this.appendedTexts = []
  }

  append(text){
    this.appendedTexts.push(text)
    return this
  }

  apply(placeholders){
    let holderItem = placeholders[this.placeholderKey]
    if(this.appendedTexts.length){
      return holderItem + this.appendedTexts.reduce((prev, val) => {
        if (val instanceof Placeholder) {
          prev += val.apply(placeholders)
        } else {
          prev += val
        }
        return prev
      },"")
    } else {
      return holderItem
    }
  }

  get placeholderKey(){
    return this.key
  }
}

export default function placeholder(key){
  return new Placeholder(key)
}
