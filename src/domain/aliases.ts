const aliases: Record<string, string> = {
  tomato: 'Tomato',
  tomatoes: 'Tomato',
  番茄: 'Tomato',
  西红柿: 'Tomato',

  potato: 'Potato',
  potatoes: 'Potato',
  马铃薯: 'Potato',
  土豆: 'Potato',

  'leafy greens': 'Leafy Greens',
  greens: 'Leafy Greens',
  青菜: 'Leafy Greens',
  小青菜: 'Leafy Greens',
  绿叶菜: 'Leafy Greens',
  叶菜: 'Leafy Greens',

  egg: 'Egg',
  eggs: 'Egg',
  鸡蛋: 'Egg',
  蛋: 'Egg',

  milk: 'Milk',
  牛奶: 'Milk',

  banana: 'Banana',
  bananas: 'Banana',
  香蕉: 'Banana',

  apple: 'Apple',
  apples: 'Apple',
  苹果: 'Apple',

  rice: 'Rice',
  'white rice': 'Rice',
  大米: 'Rice',
  米: 'Rice',

  noodles: 'Noodles',
  noodle: 'Noodles',
  面条: 'Noodles',
  挂面: 'Noodles',

  tofu: 'Tofu',
  豆腐: 'Tofu',

  cabbage: 'Cabbage',
  白菜: 'Cabbage',

  beef: 'Beef',
  牛肉: 'Beef',

  'chicken breast': 'Chicken Breast',
  chicken: 'Chicken Breast',
  鸡胸肉: 'Chicken Breast',

  yogurt: 'Yogurt',
  酸奶: 'Yogurt',

  bread: 'Bread',
  面包: 'Bread',

  corn: 'Corn',
  玉米: 'Corn',

  nuts: 'Nuts',
  nut: 'Nuts',
  坚果: 'Nuts',

  spinach: 'Spinach',
  菠菜: 'Spinach',

  carrot: 'Carrot',
  carrots: 'Carrot',
  胡萝卜: 'Carrot',

  oats: 'Oats',
  oatmeal: 'Oats',
  燕麦: 'Oats',

  mushroom: 'Mushroom',
  mushrooms: 'Mushroom',
  香菇: 'Mushroom',

  cucumber: 'Cucumber',
  cucumbers: 'Cucumber',
  黄瓜: 'Cucumber',

  shrimp: 'Shrimp',
  虾仁: 'Shrimp',

  'soy milk': 'Soy Milk',
  soymilk: 'Soy Milk',
  豆浆: 'Soy Milk',
};

export function normalizeIngredientName(name: string): string {
  const trimmed = name.trim();
  return aliases[trimmed] ?? aliases[trimmed.toLowerCase()] ?? trimmed;
}
