const aliases: Record<string, string> = {
  番茄: '西红柿',
  西红柿: '西红柿',
  马铃薯: '土豆',
  土豆: '土豆',
  青菜: '叶菜',
  小青菜: '叶菜',
  绿叶菜: '叶菜',
  叶菜: '叶菜',
  鸡蛋: '鸡蛋',
  蛋: '鸡蛋',
  牛奶: '牛奶',
  香蕉: '香蕉',
  苹果: '苹果',
  大米: '大米',
  米: '大米',
  面条: '面条',
  挂面: '面条',
  豆腐: '豆腐',
};

export function normalizeIngredientName(name: string): string {
  const trimmed = name.trim();
  return aliases[trimmed] ?? trimmed;
}
