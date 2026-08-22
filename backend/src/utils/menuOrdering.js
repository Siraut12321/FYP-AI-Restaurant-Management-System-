export const CATEGORY_ORDER = [
  'rolls',
  'drinks',
  'pizza',
  'burgers',
  'dessert',
  'chinese',
  'fast food',
  'deals',
  'biryani',
  'bbq',
];

export const categoryKey = (category = '') => category.trim().toLowerCase();

export const categoryRankExpression = {
  $let: {
    vars: { rank: { $indexOfArray: [CATEGORY_ORDER, { $toLower: '$category' }] } },
    in: { $cond: [{ $gte: ['$$rank', 0] }, '$$rank', CATEGORY_ORDER.length] },
  },
};