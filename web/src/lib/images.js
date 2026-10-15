// Verified Unsplash photo IDs (checked to return 200). Food photography only.
export const IMG = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  macarons: [
    IMG('1558326567-98ae2405596b'),
    IMG('1569864358642-9d1684040f43'),
    IMG('1486427944299-d1955d23e34d'),
    IMG('1519869325930-281384150729'),
  ],
  cakes: [
    IMG('1578985545062-69928b1d9587'),
    IMG('1550617931-e17a7b70dce2'),
    IMG('1621303837174-89787a7d4729'),
    IMG('1535141192574-5d4897c12636'),
    IMG('1464349095431-e9a21285b5f3'),
  ],
  cupcakes: [
    IMG('1565958011703-44f9829ba187'),
    IMG('1495147466023-ac5c588e2e94'),
    IMG('1517686469429-8bdb88b9f907'),
    IMG('1587668178277-295251f900ce'),
  ],
  pastries: [
    IMG('1509440159596-0249088772ff'),
    IMG('1555507036-ab1f4038808a'),
    IMG('1551024506-0bccd828d307'),
  ],
  boxes: [IMG('1606313564200-e75d5e30476c'), IMG('1587241321921-91a834d6d191')],
  fruit: [IMG('1464965911861-746a04b4bca6')],
  desserts: [
    IMG('1516684732162-798a0062be99'),
    IMG('1576618148400-f54bed99fcfd'),
    IMG('1541592106381-b31e9677c0e5'),
    IMG('1590080875515-8a3a8dc5735e'),
  ],
};

export const HERO_CAKE = IMG('1578985545062-69928b1d9587', 1400);
