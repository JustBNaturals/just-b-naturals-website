(() => {
  const params = new URLSearchParams(location.search);
  const isFrench = params.get("lang") === "fr";
  const productTranslations = {
    "matcha-lavender-soap": ["Matcha et lavande", "Un savon apaisant et riche en minéraux, préparé avec des huiles biologiques, du beurre de karité brut et un mélange délicat de matcha et de lavande."],
    "rosemary-sage-soap": ["Romarin et sauge", "Un savon frais et herbacé aux huiles biologiques, enrichi de romarin et de sauge pour une mousse crémeuse."],
    "lemon-rosemary-soap": ["Citron et romarin", "Un savon lumineux aux notes fraîches de citron et de romarin, fabriqué avec des huiles biologiques et du beurre de karité brut."],
    "ember-ash-soap": ["Braise et cendre", "Un savon audacieux au charbon activé, à l'allure sobre et moderne, qui produit une mousse douce et crémeuse."],
    "sweater-weather-soap": ["Ptite laine", "Un savon réconfortant aux tons profonds et aux arômes chaleureux, fabriqué en petites quantités avec des huiles nourrissantes."],
    "coconut-lavender-soap": ["Coco et lavande", "Un savon doux et crémeux au lait de coco biologique et à la lavande, conçu pour une mousse délicate et nourrissante."],
    "whisper-citrus-soap": ["Souffle d'agrumes", "Un savon frais et minimaliste aux huiles biologiques, relevé d'un léger parfum d'agrumes."],
    "charcoal-blush-soap": ["Charbon et rose", "Un savon au charbon activé avec un parfum naturel très léger et une mousse douce et crémeuse."],
    "cedar-eucalyptus-loofah-soap": ["Luffa au cèdre et à l'eucalyptus", "Un savon exfoliant avec luffa, aux notes boisées de cèdre et à la fraîcheur de l'eucalyptus."],
    "lemongrass-lavender-soap": ["Citronnelle et lavande", "Un savon botanique équilibré où la fraîcheur de la citronnelle rencontre la douceur de la lavande."],
    "ylang-ylang-soap": ["Ylang-ylang", "Un savon floral et enveloppant à l'ylang-ylang, fabriqué avec des huiles biologiques et du beurre de karité brut."],
    "honey-oat-comfort-soap": ["Suif et avoine", "Un savon réconfortant au suif, au miel brut et à l'avoine colloïdale, sans huiles essentielles."],
    "chocolate-pumpkin-pie-soap": ["Citrouille", "Un savon automnal à la citrouille, aux épices chaudes et à la couleur naturellement dorée du curcuma."],
    "almond-milk-mocha-soap": ["Mocha Latté", "Un savon crémeux au lait d'amande biologique, au cacao et au café, inspiré d'un mocha latté réconfortant."],
    "unscented-loofah-soap": ["Luffa au naturel", "Un savon exfoliant au naturel, simple et pratique, enrichi d'un luffa naturel."],
    "mint-eucalyptus-spa-soap": ["Menthe et eucalyptus", "Un savon frais de style spa aux notes vivifiantes de menthe et d'eucalyptus."],
    "spiced-banana-soap": ["Banane épicée", "Un savon chaleureux à la banane et aux épices, fabriqué en petites quantités pour une mousse crémeuse."],
    "cedar-lemon-soap": ["Cèdre et citron", "Un savon boisé et vif où le cèdre s'équilibre avec la fraîcheur du citron."],
    "mango-butter": ["Beurre de mangue", "Un soin corporel riche et sans eau, composé de beurres végétaux et d'huiles nourrissantes pour la peau sèche."],
    "vanilla-infused-tallow": ["Suif fouetté à la vanille", "Un baume fouetté riche au suif nourri à l'herbe, délicatement infusé à la vanille."],
    "unscented-tallow": ["Suif fouetté au naturel", "Un baume fouetté au naturel, simple et nourrissant, conçu pour les peaux sèches."],
    "just-b-calm": ["Calme", "Créé avec des plantes reconnues depuis longtemps pour leurs qualités apaisantes et ancrantes, ce mélange procure une douce sensation de réconfort et de stabilité. Avec ses notes fraîches d'agrumes, ses touches florales délicates et ses arômes herbacés, il offre un soutien doux au quotidien dans les moments où l'on souhaite se recentrer et retrouver son calme."],
    "just-b-relieved": ["Apaisé", "Une huile botanique à bille, fraîche et aromatique, préparée avec de l'huile de jojoba biologique et un mélange concentré de menthe poivrée, d'eucalyptus, de romarin, de lavande et d'encens."],
    "cycle-harmony": ["Équilibré", "Une huile botanique douce et apaisante, conçue pour le massage du bas-ventre et les rituels réconfortants tout au long du cycle. Les huiles essentielles biologiques de géranium, de lavande, de camomille romaine et d'encens sont mélangées à une huile de pépins de raisin légère pour créer un arôme doux, floral, herbacé et ancré."],
    "lavender-bloom-scrub": ["Fleur de lavande", "Un exfoliant au sucre biologique et à la lavande qui polit doucement la peau tout en la laissant souple."],
    "harvest-spa-scrub": ["Récolte", "Un exfoliant au sucre biologique aux notes chaleureuses et réconfortantes, enrichi de beurres et d'huiles nourrissantes."],
    "vanilla-scrub": ["Vanille", "Un exfoliant au sucre biologique à la vanille, crémeux et nourrissant, qui laisse la peau douce et lisse."],
    "just-b-rested-room-spray": ["Brume d'ambiance et de linge", "Une brume botanique légère pour rafraîchir doucement les pièces et le linge de maison."],
    "solid-dish-soap": ["Savon solide pour la vaisselle", "Un savon solide durable et peu emballé, accompagné d'une brosse réutilisable en bambou pour la vaisselle quotidienne."],
    "blue-cedar-soap": ["Cèdre bleu", "Un savon boisé aux tons bleus naturels et à la mousse riche, inspiré de la fraîcheur du cèdre."],
    "chamomile-soap": ["Camomille", "Un savon doux à la camomille, fabriqué avec des huiles biologiques et du beurre de karité brut."],
    "forest-soap": ["Forêt", "Un savon frais et boisé inspiré de la forêt, coloré avec des ingrédients naturels."],
    "ocean-soap": ["Océan", "Un savon frais aux nuances bleues et grises naturelles, inspiré de l'air marin."],
    "rose-matter-soap": ["Rose Garance", "Un savon floral aux tons de rose naturels, fabriqué en petites quantités avec des huiles nourrissantes."]
  };

  const ingredientTerms = [
    [/Saponified Oils/gi, "Huiles saponifiées"], [/Organic Olive Oil/gi, "huile d'olive biologique"],
    [/Organic Coconut Oil/gi, "huile de coco biologique"], [/Raw Unrefined Shea Butter/gi, "beurre de karité brut non raffiné"],
    [/Unrefined Shea Butter/gi, "beurre de karité non raffiné"], [/All-Natural Castor Oil/gi, "huile de ricin naturelle"],
    [/Organic Cane Sugar/gi, "sucre de canne biologique"], [/Organic Castor Oil/gi, "huile de ricin biologique"],
    [/Organic Jojoba Oil/gi, "huile de jojoba biologique"], [/Organic Rosehip Oil/gi, "huile de rose musquée biologique"],
    [/Castor Oil/gi, "huile de ricin"], [/Sweet Almond Oil/gi, "huile d'amande douce"], [/Jojoba Oil/gi, "huile de jojoba"],
    [/Organic Coconut Milk/gi, "lait de coco biologique"], [/Organic Almond Milk/gi, "lait d'amande biologique"],
    [/Kaolin Clay/gi, "argile kaolin"], [/French Green Clay/gi, "argile verte française"], [/French Pink Clay/gi, "argile rose française"],
    [/Brazilian Purple Clay/gi, "argile violette du Brésil"], [/Activated Charcoal/gi, "charbon activé"],
    [/Arrowroot Powder/gi, "poudre d'arrow-root"], [/All-Natural Vitamin E/gi, "vitamine E naturelle"],
    [/Steam-Distilled Essential Oils/gi, "huiles essentielles distillées à la vapeur"], [/Organic Essential Oils/gi, "huiles essentielles biologiques"], [/Essential Oils/gi, "huiles essentielles"],
    [/Sweet Orange/gi, "orange douce"], [/Peppermint/gi, "menthe poivrée"], [/Frankincense/gi, "encens"], [/Lavender/gi, "lavande"],
    [/Raw Honey/gi, "miel brut"], [/Colloidal Oatmeal/gi, "avoine colloïdale"], [/Colloidal Oats/gi, "avoine colloïdale"],
    [/Grass-Fed Tallow/gi, "suif de bovins nourris à l'herbe"], [/Vitamin E/gi, "vitamine E"],
    [/Cocoa Powder/gi, "poudre de cacao"], [/Turmeric/gi, "curcuma"], [/Cinnamon/gi, "cannelle"],
    [/Himalayan Salt/gi, "sel de l'Himalaya"], [/Indigo Powder/gi, "poudre d'indigo"], [/Chlorella/gi, "chlorelle"]
  ];

  function translateIngredients(value) {
    return ingredientTerms.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), String(value || ""));
  }

  function prepare(products) {
    if (!isFrench || !Array.isArray(products)) return;
    const categoryDetails = {
      "artisan-soap": "Découvrez les huiles, beurres, argiles, plantes et huiles essentielles qui donnent à ce savon sa mousse, sa couleur et sa senteur particulières.",
      "sugar-scrubs": "Sa texture associe une exfoliation au sucre à des beurres et huiles nourrissants pour laisser la peau douce et souple.",
      "roller-oils": "Les huiles végétales et essentielles sont choisies pour créer un rituel aromatique portatif, simple et agréable à utiliser.",
      "body-care": "Cette formule concentrée et sans eau mise sur des beurres et huiles riches. Une petite quantité suffit pour nourrir les zones sèches.",
      "home-linen": "Cette formule privilégie des ingrédients simples et une utilisation pratique pour prendre soin de la maison et du linge au quotidien."
    };
    products.forEach(product => {
      const translated = productTranslations[product.id];
      if (translated) {
        product.name = translated[0];
        product.description = translated[1];
        product.cardDescription = translated[1];
        product.sections = [{ title: "En détail", paragraphs: [translated[1], categoryDetails[product.category] || "Consultez les détails et les ingrédients pour en savoir plus sur ce produit."] }];
      }
      product.ingredients = Array.isArray(product.ingredients) ? product.ingredients.map(translateIngredients) : [translateIngredients(product.ingredients)];
      product.kicker = "JUST B NATURAL";
      product.note = "";
      if (product.imageNote) product.imageNote = "Photo de la collection. Photo individuelle à venir.";
      if (product.category === "artisan-soap") {
        product.use = "Faire mousser avec de l'eau, laver puis rincer soigneusement. Laisser sécher le savon entre les utilisations.";
        product.safety = "Consulter la liste complète des ingrédients avant usage. Cesser l'utilisation en cas d'irritation. Usage externe seulement.";
      } else if (product.category === "sugar-scrubs") {
        product.use = "Masser une petite quantité sur la peau humide en mouvements circulaires, puis rincer soigneusement. Utiliser jusqu'à deux fois par semaine.";
        product.safety = "Éviter la peau irritée ou fraîchement rasée. Garder l'eau hors du pot et faire attention aux surfaces glissantes.";
      } else if (product.category === "body-care") {
        product.use = "Appliquer une petite quantité sur une peau propre et sèche, puis masser jusqu'à absorption.";
        product.safety = "Conserver dans un endroit frais et sec, à l'abri du soleil. La texture naturelle peut varier selon la température.";
      } else if (product.category === "roller-oils") {
        product.use = "Appliquer sur les points de pulsation suggérés, respirer l'arôme et renouveler au besoin.";
        product.safety = "Usage externe seulement. Éviter le contour des yeux et cesser l'utilisation en cas d'irritation.";
      } else if (product.id === "solid-dish-soap") {
        product.use = "Frotter une brosse humide sur le savon, faire mousser, laver la vaisselle puis rincer.";
        product.safety = "Laisser sécher le savon et la brosse entre les utilisations. Usage ménager seulement.";
      } else if (product.id === "just-b-rested-room-spray") {
        product.use = "Vaporiser légèrement dans la pièce ou sur le linge à une distance sécuritaire.";
        product.safety = "Tester d'abord sur une zone peu visible. Éviter les yeux, les flammes et les surfaces délicates.";
      }
    });
  }

  const text = new Map(Object.entries({
    "Skip to content":"Aller au contenu", "Home":"Accueil", "Shop":"Boutique", "Shop all":"Tout magasiner", "All products":"Tous les produits",
    "Artisan soap":"Savons artisanaux", "Artisan soaps":"Savons artisanaux", "Artisan Soaps":"Savons artisanaux", "Sugar scrubs":"Exfoliants au sucre", "Sugar Scrubs":"Exfoliants au sucre",
    "Botanical oils":"Huiles botaniques", "Botanical Oils":"Huiles botaniques", "Roll-on oils":"Huiles botaniques", "Roll-On Oils":"Huiles botaniques", "Body care":"Soins corporels", "Body Care":"Soins corporels", "Home & linen":"Maison et linge", "Home & Linen":"Maison et linge",
    "About":"À propos", "Privacy":"Confidentialité", "Products":"Produits", "Cart":"Panier", "View cart":"Voir le panier", "Close cart":"Fermer le panier", "Open menu":"Ouvrir le menu", "Close menu":"Fermer le menu",
    "Handmade in Gatineau, Québec":"Fait à la main à Gatineau, Québec", "Simple ingredients.":"Des ingrédients simples.", "Beautiful everyday rituals.":"De beaux rituels au quotidien.",
    "JUST B ❁ Clean & Authentic. Pure ingredients, gentle on the earth. Scented only with pure steam-distilled essential oils, coloured with natural clays, and thoughtfully crafted without synthetic shortcuts to complement nature’s design.":"JUST B ❁ Propre et authentique. Des ingrédients purs et doux pour la planète. Des parfums composés uniquement d'huiles essentielles pures distillées à la vapeur, des couleurs tirées d'argiles naturelles et une fabrication réfléchie, sans raccourcis synthétiques, dans le respect de la nature.",
    "Shop all products":"Voir tous les produits", "How to order":"Comment commander", "Explore the collection":"Découvrir la collection", "Shop by category":"Magasiner par catégorie", "View all products":"Voir tous les produits",
    "Pure, handcrafted bars in rotating scents and colours.":"Des savons purs, fabriqués à la main, offerts dans une sélection changeante de senteurs et de couleurs.",
    "Calm, Eased and Balanced botanical oils.":"Trois huiles botaniques portatives : Calme, Apaisé et Équilibré.",
    "Lavender Bloom, Harvest and Vanilla exfoliating scrubs.":"Des exfoliants au sucre Fleur de lavande, Récolte et Vanille.",
    "Mango butter and whipped tallow moisturizers.":"Des soins hydratants au beurre de mangue et au suif fouetté.", "Rested room spray and zero-waste solid dish soap.":"Une brume Rested et un savon solide zéro déchet pour la vaisselle.",
    "Ingredients, scents & care":"Ingrédients, senteurs et conseils", "Curious about what goes into each product?":"Envie de découvrir ce qui entre dans chaque produit?",
    "Explore the ingredients, essential-oil scents, soapmaking basics, care guidance, and answers to common questions.":"Découvrez les ingrédients, les arômes d'huiles essentielles, les bases de la savonnerie, les conseils d'utilisation et les réponses aux questions courantes.",
    "Visit the FAQ":"Consulter la FAQ", "A few favourites":"Quelques coups de cœur", "Featured products":"Produits vedettes", "Open any product for its full details.":"Ouvrez un produit pour voir tous les détails.",
    "Follow along on Instagram":"Suivez-nous sur Instagram", "New batches, current scents and availability are shared on Instagram.":"Les nouveaux lots, les parfums du moment et les disponibilités sont partagés sur Instagram.", "Visit Instagram":"Voir Instagram", "Personal, simple and direct":"Personnel, simple et direct", "How ordering works":"Comment fonctionne la commande",
    "Build your cart":"Remplissez votre panier", "Add one or several products while you browse.":"Ajoutez un ou plusieurs produits pendant votre visite.", "Send your request":"Envoyez votre demande", "Review quantities, add a note, and choose your preferred payment method.":"Vérifiez les quantités, ajoutez une note et choisissez votre mode de paiement préféré.", "Confirm":"Confirmation", "We will confirm availability and pickup details by email. Local delivery is available for an additional distance-based fee.":"Nous confirmerons la disponibilité et les détails de ramassage par courriel. La livraison locale est offerte selon les conditions affichées au paiement.",
    "The complete collection":"Toute la collection", "Browse every product, add your favourites to your cart and send a request when you are ready.":"Parcourez tous les produits, ajoutez vos préférés au panier et envoyez votre demande lorsque vous êtes prête ou prêt.", "All":"Tout", "Guest order requests • Pay after confirmation":"Demandes de commande • Paiement après confirmation",
    "Sort or filter products":"Trier ou filtrer", "Featured first":"Produits vedettes", "Name A–Z":"Nom de A à Z", "Price: low to high":"Prix croissant", "Price: high to low":"Prix décroissant", "Show preorders only":"Précommandes seulement", "No products found":"Aucun produit trouvé", "Try a different product name or ingredient.":"Essayez un autre nom de produit ou ingrédient.",
    "Simple ingredients, luxurious lather":"Des ingrédients simples, une mousse somptueuse", "Pure, natural, small-batch soap bars. Discover rotating scents, earthy colours, and creamy textures, all handcrafted with organic oils, unrefined shea butter, and steam-distilled essential oils.":"Des savons purs et naturels, fabriqués à la main en petites quantités. Découvrez une sélection changeante de senteurs, de tons terreux et de textures crémeuses, tous préparés avec des huiles biologiques, du beurre de karité non raffiné et des huiles essentielles distillées à la vapeur.", "Availability":"Disponibilité", "Reserve your favourites":"Réservez vos coups de cœur", "Bars are handcrafted in small batches, so quantities may be limited. Special orders are welcome and require approximately six weeks of cure time for a mild, hard and long-lasting bar.":"Les savons sont fabriqués à la main en petites quantités. Les commandes spéciales sont les bienvenues et demandent environ six semaines de cure pour obtenir un savon doux, ferme et durable.",
    "Polish, nourish, glow":"Exfolier, nourrir, rayonner", "Organic Blend Sugar Scrubs":"Exfoliants au sucre biologiques", "Small-batch body scrubs made with organic cane sugar, unrefined shea butter, and nourishing botanical oils. Lavender Bloom, Harvest, and Vanilla gently polish dry skin while leaving it soft, smooth, and moisturized.":"Des exfoliants corporels fabriqués en petites quantités avec du sucre de canne biologique, du beurre de karité non raffiné et des huiles végétales nourrissantes. Fleur de lavande, Récolte et Vanille lissent doucement la peau sèche et la laissent souple, douce et hydratée.", "For best results":"Pour de meilleurs résultats", "Use up to twice per week":"Utiliser jusqu'à deux fois par semaine", "Massage a small amount onto damp skin in gentle circular motions, then rinse thoroughly. Keep water out of the jar, avoid broken or freshly shaved skin, and use care as oils may make surfaces slippery.":"Massez une petite quantité sur la peau humide en mouvements circulaires, puis rincez soigneusement. Gardez l'eau hors du pot, évitez la peau irritée ou fraîchement rasée et faites attention aux surfaces glissantes.",
    "Everyday wellness, naturally":"Un bien-être naturel au quotidien", "Three portable botanical oils—Calm, Eased, and Balanced—made with lightweight carrier oils and carefully chosen essential oils. Each blend supports a simple aromatic self-care ritual wherever the day takes you.":"Trois huiles botaniques portatives — Calme, Apaisé et Équilibré — préparées avec des huiles porteuses légères et des huiles essentielles choisies avec soin. Chaque mélange accompagne un rituel de bien-être aromatique simple, où que la journée vous mène.", "A gentle ritual":"Un rituel tout en douceur", "Roll on. Breathe deeply.":"Appliquez. Respirez profondément.", "Apply to the suggested pulse points, inhale the aroma, and reapply as desired. For external use only. Avoid the eye area and discontinue use if irritation occurs.":"Appliquez sur les points de pulsation suggérés, respirez l'arôme et renouvelez au besoin. Usage externe seulement. Évitez le contour des yeux et cessez l'utilisation en cas d'irritation.",
    "Deep hydration, naturally":"Une hydratation profonde, naturellement", "Rich, water-free moisturizers made in small batches for dry, thirsty skin. Choose plant-based Mango Butter or whipped grass-fed tallow in vanilla-infused and unscented formulas, all crafted with thoughtfully selected oils and vitamin E.":"Des soins riches et sans eau, fabriqués en petites quantités pour les peaux sèches. Choisissez le beurre de mangue végétal ou le suif fouetté nourri à l'herbe, à la vanille ou sans parfum, tous préparés avec des huiles choisies avec soin et de la vitamine E.", "Daily nourishment":"Un soin nourrissant au quotidien", "Made for dry, thirsty skin":"Pensé pour les peaux sèches", "Apply a small amount to clean, dry skin and massage until absorbed. Store in a cool, dry place away from sunlight. Natural texture changes may occur with temperature.":"Appliquez une petite quantité sur une peau propre et sèche, puis massez jusqu'à absorption. Conservez dans un endroit frais et sec, à l'abri du soleil. La texture naturelle peut varier selon la température.",
    "Thoughtful home essentials":"Des essentiels bien pensés pour la maison", "Thoughtful, zero-waste essentials for everyday spaces. Refresh rooms and linens with a soft botanical mist, or pair the long-lasting solid dish soap with its reusable bamboo bristle brush for practical kitchen cleaning.":"Des essentiels pratiques et zéro déchet pour la maison. Rafraîchissez les pièces et le linge avec une douce brume botanique, ou utilisez le savon solide longue durée avec sa brosse réutilisable en bambou pour la vaisselle quotidienne.", "Made to be useful":"Conçus pour être utiles", "Simple care for everyday spaces":"Des soins simples pour la maison", "Open either product for its complete ingredients, directions, and care information from the current product document.":"Ouvrez chaque produit pour consulter ses ingrédients, son mode d'emploi et ses conseils d'entretien.",
    "A little about Just B":"Un peu sur Just B", "Natural care,":"Des soins naturels,", "made personally.":"faits avec attention.", "Meet Brigitte Gariepy, the maker behind Just B Natural, a small-batch collection of everyday care and home products handcrafted in Gatineau, Québec.":"Découvrez Brigitte Gariepy, l'artisane derrière Just B Natural, une collection de soins et de produits pour la maison fabriqués en petites quantités à Gatineau, Québec.", "Follow on Instagram":"Suivre sur Instagram", "Brigitte Gariepy’s story":"L'histoire de Brigitte Gariepy", "A simple idea, made with care.":"Une idée simple, réalisée avec soin.",
    "Just B Natural grew from my desire to make everyday care feel simpler, more thoughtful, and more personal. I create every product in small batches with carefully chosen ingredients and hands-on attention. What began as a simple idea has grown into a collection of soaps, body care, and home essentials that fit naturally into real life. I make each batch myself here in Gatineau, Québec.":"Just B Natural est né de mon désir de rendre les soins du quotidien plus simples, plus réfléchis et plus personnels. Je fabrique chaque produit en petites quantités avec des ingrédients choisis avec soin et une attention de tous les instants. Ce qui a commencé par une idée toute simple est devenu une collection de savons, de soins corporels et d'essentiels pour la maison qui s'intègrent naturellement à la vraie vie. Je prépare moi-même chaque lot ici, à Gatineau, Québec.",
    "Before soapmaking, I spent over 25 years as a baker and cake decorator. That work shaped my love of craft, detail, and creating with my hands. I’ve always been artsy and a little bit crafty, and after retiring from the baking world, I found myself drawn back to the basics: making sourdough, brewing kombucha, reconnecting with simple, traditional skills. Soap came next, and one batch led to another until Just B Natural took shape.":"Avant de me lancer dans la savonnerie, j'ai travaillé pendant plus de 25 ans comme boulangère-pâtissière et décoratrice de gâteaux. Ce métier a nourri mon amour du travail manuel, du détail et de la création. J'ai toujours eu un côté artistique et bricoleur. Après avoir quitté le monde de la boulangerie, j'ai ressenti le besoin de revenir à l'essentiel: faire du pain au levain, préparer du kombucha et renouer avec des savoir-faire simples et traditionnels. Le savon est venu ensuite, puis un lot en a entraîné un autre jusqu'à ce que Just B Natural prenne forme.",
    "Today, I choose to grow old naturally, to use real ingredients, and to keep life as honest and uncomplicated as possible. My products reflect that philosophy: made with intention, crafted by hand, and designed to support a life that values simplicity, authenticity, and the beauty of staying true to yourself.":"Aujourd'hui, je choisis de vieillir naturellement, d'utiliser de vrais ingrédients et de garder la vie aussi honnête et simple que possible. Mes produits reflètent cette philosophie: ils sont créés avec intention, fabriqués à la main et pensés pour accompagner une vie qui valorise la simplicité, l'authenticité et la beauté de rester fidèle à soi-même.", "Naturally yours,":"Tout naturellement,", "Simply natural":"Simplement naturel", "A calm, straightforward approach to ingredients and everyday care.":"Une approche calme et transparente des ingrédients et des soins quotidiens.", "Small-batch care":"Le soin des petites quantités", "Made in limited quantities with attention given to each product.":"Fabriqué en quantités limitées avec une attention particulière pour chaque produit.", "Human connection":"Un lien humain", "Questions and order confirmations are handled personally by email or Instagram.":"Les questions et les confirmations de commande sont traitées personnellement par courriel ou Instagram.", "Find your ritual":"Trouvez votre rituel", "Browse slowly.":"Prenez votre temps.", "Choose what feels right.":"Choisissez ce qui vous convient.", "Explore the full collection, learn about our ingredients and scents, or collect your favourites in the cart.":"Découvrez toute la collection, renseignez-vous sur les ingrédients et les parfums, ou rassemblez vos coups de cœur dans le panier.", "Ingredients & FAQ":"Ingrédients et FAQ",
    "Ingredients, scents & answers":"Ingrédients, parfums et réponses", "What goes into":"Ce qui entre dans", "every thoughtful batch.":"chaque lot soigneusement préparé.", "Get to know the simple foundation behind our soap, the essential oils that give each bar its character, and the natural additives that create colour and texture.":"Découvrez la base simple de nos savons, les huiles essentielles qui donnent son caractère à chaque barre et les ajouts naturels qui créent couleur et texture.", "The foundation":"La base", "The basics":"Les ingrédients de base", "Every bar of soap starts with a simple, traditional blend of ingredients. Each one has a clear purpose.":"Chaque savon commence par un mélange simple et traditionnel d'ingrédients. Chacun joue un rôle précis.", "Organic olive oil":"Huile d'olive biologique", "Creates a gentle, conditioning lather.":"Crée une mousse douce et revitalisante.", "Unrefined shea butter":"Beurre de karité non raffiné", "Adds creaminess and helps the bar last longer.":"Ajoute de l'onctuosité et aide le savon à durer plus longtemps.", "Organic coconut oil":"Huile de coco biologique", "Adds cleansing power and rich foam.":"Apporte un pouvoir nettoyant et une mousse abondante.", "Castor oil":"Huile de ricin", "Stabilizes the lather and boosts moisture.":"Stabilise la mousse et favorise l'hydratation.", "Distilled water & sodium hydroxide":"Eau distillée et hydroxyde de sodium", "Allow the oils to combine and become true soap through saponification.":"Permettent aux huiles de se transformer en véritable savon par saponification.",
    "Lye is required to make true soap. During saponification, it fully reacts with the oils, and the water evaporates as the bar cures, leaving a safe, solid finished bar. This reaction is complete, meaning no lye remains in the final product. What starts as oils, water, and sodium hydroxide becomes something entirely new: a gentle, cleansing bar of soap and naturally occurring glycerin. By the time the soap has cured, the mixture has transformed, hardened, and neutralized, resulting in a bar that is safe, mild, and ready for use.":"La soude caustique est essentielle à la fabrication du véritable savon. Pendant la saponification, elle réagit complètement avec les huiles, tandis que l'eau s'évapore durant la cure. Cette réaction est complète: il ne reste donc aucune soude dans le produit fini. Les huiles, l'eau et l'hydroxyde de sodium se transforment en quelque chose de tout nouveau, soit un savon doux et nettoyant accompagné de glycérine naturellement produite. À la fin de la cure, le mélange est transformé, durci et neutralisé; le savon est alors doux, sécuritaire et prêt à utiliser.",
    "Pure botanical aroma":"Des arômes botaniques purs", "The scents":"Les parfums", "Our scented bars are made with carefully chosen steam-distilled essential oils. Citrus, herbs, flowers, woods, and resins are blended to give each product its own gentle character.":"Nos savons parfumés sont composés d'huiles essentielles distillées à la vapeur et choisies avec soin. Agrumes, herbes, fleurs, bois et résines sont assemblés pour donner à chaque produit un caractère délicat qui lui est propre.", "Because the aroma comes from real botanical ingredients, not synthetic fragrance oils, it may soften over time and vary slightly from one small batch to the next. Unscented options are clearly identified in their product details.":"Comme les arômes proviennent de véritables ingrédients botaniques plutôt que de parfums synthétiques, ils peuvent s'adoucir avec le temps et varier légèrement d'un lot à l'autre. Les options sans parfum sont clairement indiquées dans les détails du produit.", "Colour, texture & character":"Couleur, texture et caractère", "Natural additives":"Ajouts naturels", "These botanicals, clays, and pantry ingredients give each bar its colour, texture, aroma, and individual finish.":"Ces plantes, argiles et ingrédients du garde-manger donnent à chaque savon sa couleur, sa texture, son arôme et son fini unique.",
    "Turmeric":"Curcuma", "Warm golden colour.":"Une teinte dorée chaleureuse.", "Kaolin clay":"Argile kaolin", "A gentle, silky feel.":"Un toucher doux et soyeux.", "French pink clay":"Argile rose française", "A soft rose tone.":"Une douce teinte rosée.", "French green clay":"Argile verte française", "Mineral-rich colour and texture.":"Une couleur et une texture riches en minéraux.", "Brazilian purple clay":"Argile violette du Brésil", "A naturally vibrant hue.":"Une teinte naturellement vibrante.", "Chlorella":"Chlorelle", "A nutrient-dense green tone.":"Une teinte verte riche.", "Activated charcoal":"Charbon activé", "A deep black finish.":"Un fini noir profond.", "Raw honey":"Miel brut", "Helps attract moisture to the skin.":"Aide à retenir l'humidité sur la peau.", "Colloidal oatmeal":"Avoine colloïdale", "A calm, comforting addition.":"Un ajout doux et réconfortant.", "Organic coconut milk":"Lait de coco biologique", "Adds creaminess and silky lather.":"Ajoute de l'onctuosité et une mousse soyeuse.", "Himalayan salt":"Sel de l'Himalaya", "Mineral-rich exfoliation and a firm bar.":"Une exfoliation minérale et un savon plus ferme.", "Indigo powder":"Poudre d'indigo", "Traditional blue and grey tones.":"Des tons bleus et gris traditionnels.", "Cocoa powder":"Poudre de cacao", "Warm colour and subtle cocoa aroma.":"Une couleur chaude et un léger arôme de cacao.", "Cinnamon":"Cannelle", "A warm tone and gentle texture.":"Une teinte chaude et une texture délicate.", "Organic almond milk":"Lait d'amande biologique", "A smooth, creamy finish.":"Un fini doux et crémeux.", "Every ingredient is selected for what it brings to the soap, not just colour, but tradition, function, texture, and character.":"Chaque ingrédient est choisi pour ce qu'il apporte au savon: sa tradition, sa fonction, sa texture et son caractère, bien au-delà de la couleur.", "Good to know":"Bon à savoir", "Frequently asked questions":"Questions fréquentes",
    "Guest order request":"Demande de commande", "Request your order":"Envoyer votre demande", "Review your cart and send your request. Nothing is charged now. You will receive payment instructions by email.":"Vérifiez votre panier et envoyez votre demande. Aucun paiement n'est prélevé maintenant. Les instructions de paiement vous seront envoyées par courriel.", "We review your request":"Nous vérifions votre demande", "Pay after confirmation":"Payez après confirmation", "Your cart":"Votre panier", "Your cart is empty.":"Votre panier est vide.", "Add a few products before checking out.":"Ajoutez quelques produits avant de poursuivre.", "Browse products":"Voir les produits", "Contact":"Coordonnées", "Your information":"Vos renseignements", "First name":"Prénom", "Last name":"Nom", "Email address":"Adresse courriel", "Phone number":"Numéro de téléphone", "optional":"facultatif", "Fulfillment":"Réception", "How will you receive it?":"Comment souhaitez-vous recevoir votre commande?", "Local pickup":"Ramassage local", "Local delivery":"Livraison locale", "Exact delivery address":"Adresse de livraison complète", "After approval":"Après approbation", "Preferred payment method":"Mode de paiement préféré", "Cash":"Comptant", "Finishing touches":"Derniers détails", "Order notes":"Notes de commande", "Anything we should know?":"Y a-t-il autre chose à savoir?", "No payment is taken now.":"Aucun paiement n'est prélevé maintenant.", "Request order":"Envoyer la demande", "Order summary":"Résumé de la commande", "Products subtotal":"Sous-total des produits", "Estimated order total":"Total estimé", "Select an address":"Choisir une adresse", "Pending address":"Adresse à confirmer", "Free":"Gratuite", "Request received":"Demande reçue", "Please wait to pay.":"Veuillez attendre avant de payer.", "Continue shopping":"Continuer à magasiner", "Return home":"Retour à l'accueil",
    "A simple note about your information.":"Une note simple sur vos renseignements.", "Orders":"Commandes", "Promotional emails":"Courriels promotionnels", "Questions":"Questions", "View shop":"Voir la boutique", "Private stock manager":"Gestion privée des stocks", "Inventory":"Inventaire", "Inventory passcode":"Code d'accès à l'inventaire", "Open inventory":"Ouvrir l'inventaire", "Save changes":"Enregistrer", "Product":"Produit", "Category":"Catégorie", "Status":"État", "Ready date":"Date de disponibilité", "Stock":"Stock", "Website":"Site Web",
    "Add to cart":"Ajouter au panier", "Add another":"En ajouter un", "Preorder":"Précommander", "View full details":"Voir tous les détails", "Out of stock":"Rupture de stock", "Currently unavailable":"Indisponible", "How to use":"Mode d'emploi", "Care & storage":"Entretien et rangement", "Before using":"Avant l'utilisation", "You may also like":"Vous aimerez peut-être", "View category":"Voir la catégorie", "Product details":"Détails du produit", "More about this product":"En savoir plus sur ce produit", "In detail":"En détail", "Product tags":"Étiquettes du produit", "À propos de ce produit":"À propos de ce produit"
  }));

  Object.entries({
    "Search botanical oils or ingredients":"Rechercher une huile botanique ou un ingrédient", "Search botanical oils or ingredients…":"Rechercher une huile botanique ou un ingrédient…",
    "Pure · Natural · Handcrafted":"Pur · Naturel · Fait à la main", "View product":"Voir le produit", "Notify me when available":"M'avertir quand il sera disponible", "Small batch":"Petite production", "Handmade in Gatineau":"Fait à la main à Gatineau", "Made with care":"Fait avec soin", "Complete product details":"Détails complets", "Everything from the product guide.":"Tous les renseignements sur ce produit.", "Ingredients":"Ingrédients", "About this product":"À propos de ce produit", "Product not found":"Produit introuvable", "This product page is unavailable.":"Cette page de produit n'est pas disponible.", "Browse all products":"Voir tous les produits",
    "Just B pure • Just B natural • Handmade in Gatineau, Québec":"Just B pur • Just B naturel • Fait à la main à Gatineau, Québec", "Browse Just B":"Découvrir Just B", "Follow @justb.naturals":"Suivre @justb.naturals", "Your selections":"Vos choix", "Your cart is empty":"Votre panier est vide", "Add a few favourites, then send an order request. Payment comes only after confirmation.":"Ajoutez quelques coups de cœur, puis envoyez votre demande. Le paiement se fait seulement après confirmation.", "No payment is taken now. Availability is confirmed before you pay.":"Aucun paiement n'est prélevé maintenant. La disponibilité est confirmée avant le paiement.", "Review request":"Vérifier la demande", "Keep shopping":"Continuer à magasiner", "Clear cart":"Vider le panier", "One-time product update":"Avis unique pour ce produit", "Let me know when it’s ready":"M'avertir lorsqu'il sera prêt", "Notify me":"M'avertir", "Stay in the loop":"Restez au courant", "Small-batch news,":"Des nouvelles de nos petites productions,", "sent occasionally.":"envoyées à l'occasion.", "Join the list":"S'inscrire", "Explore":"Découvrir", "Connect":"Nous joindre", "Request an order":"Faire une demande", "For external use only unless otherwise stated.":"Usage externe seulement, sauf indication contraire.", "Small-batch, handcrafted soaps and natural care made in Gatineau, Québec.":"Savons et soins naturels fabriqués à la main en petites quantités à Gatineau, Québec.",
    "Is lye still present in finished soap?":"Reste-t-il de la soude caustique dans le savon fini?", "No. Sodium hydroxide is essential to traditional soapmaking, but it is fully used during saponification. Properly formulated and cured bars do not contain active lye.":"Non. L'hydroxyde de sodium est essentiel à la savonnerie traditionnelle, mais il est entièrement transformé pendant la saponification. Un savon bien formulé et suffisamment mûri ne contient plus de soude active.", "What scents do you use?":"Quels parfums utilisez-vous?", "Scented products use pure essential oils selected to create botanical citrus, floral, herbal, minty, woody, or resinous blends. We do not use synthetic fragrance oils.":"Nos produits parfumés utilisent de pures huiles essentielles choisies pour créer des mélanges d'agrumes, floraux, herbacés, mentholés, boisés ou résineux. Nous n'utilisons pas de parfums synthétiques.", "Why do bars vary in colour and pattern?":"Pourquoi la couleur et les motifs varient-ils?", "Each batch is poured and cut by hand. Natural clays, botanical powders, and small variations in the process mean the colour and pattern may differ slightly from the product photo.":"Chaque lot est coulé et coupé à la main. Les argiles, les poudres botaniques et les petites variations du procédé peuvent donner une couleur ou un motif légèrement différent de la photo.", "Are the colours synthetic?":"Les couleurs sont-elles synthétiques?", "Our soap colours come from ingredients such as clays, indigo, turmeric, chlorella, cocoa, charcoal, and madder root. Check each product page for its exact ingredient list.":"Les couleurs proviennent d'ingrédients comme les argiles, l'indigo, le curcuma, la chlorelle, le cacao, le charbon et la garance. Consultez chaque fiche pour connaître la liste exacte des ingrédients.", "How should I store a handmade bar?":"Comment conserver un savon artisanal?", "Let the bar dry between uses on a draining soap dish and keep it away from standing water. A dry bar lasts longer.":"Laissez le savon sécher entre les utilisations sur un porte-savon qui s'égoutte et gardez-le loin de l'eau stagnante. Un savon bien sec dure plus longtemps.", "Are products made in small batches?":"Les produits sont-ils fabriqués en petites quantités?", "Yes. Products are handcrafted in limited quantities, so availability and small visual details can change from batch to batch.":"Oui. Les produits sont fabriqués à la main en quantités limitées. La disponibilité et certains détails visuels peuvent donc varier d'un lot à l'autre.",
    "Pickup details will be confirmed by email.":"Les détails du ramassage seront confirmés par courriel.", "$10 within 20 km of Aylmer. Free on product orders of $75 or more.":"10 $ dans un rayon de 20 km d'Aylmer. Gratuite dès 75 $ de produits.", "Your neighbourhood or general area":"Votre quartier ou secteur", "For example: Aylmer or Hull":"Par exemple: Aylmer ou Hull", "Start typing your street address":"Commencez à saisir votre adresse", "Simple local delivery.":"Livraison locale simple.", "Delivery is $10 within 20 km of Aylmer, or free when your product subtotal is $75 or more.":"La livraison coûte 10 $ dans un rayon de 20 km d'Aylmer et elle est gratuite lorsque le sous-total des produits atteint 75 $.", "Type your address, then choose the matching suggestion to confirm that it is inside our local delivery zone.":"Saisissez votre adresse, puis choisissez la suggestion correspondante pour confirmer qu'elle se trouve dans notre zone de livraison.", "Select an address suggestion to confirm local delivery.":"Choisissez une suggestion d'adresse pour confirmer la livraison locale.", "The calculator only confirms the delivery zone and applies the flat fee. Your total appears here and in your order email.":"Le calculateur confirme uniquement la zone de livraison et applique le tarif fixe. Votre total s'affiche ici et dans votre courriel de commande.", "Interac e-Transfer":"Virement Interac", "Do not send payment yet. Instructions arrive only after your items are confirmed.":"N'envoyez pas le paiement tout de suite. Les instructions suivront une fois les articles confirmés.", "Pay at pickup or delivery, after your order has been confirmed.":"Payez au ramassage ou à la livraison, une fois la commande confirmée.", "Send me occasional news and promotions from Just B Natural. I can unsubscribe anytime.":"Envoyez-moi à l'occasion des nouvelles et promotions de Just B Natural. Je peux me désabonner en tout temps.", "Promotional emails are optional. See the":"Les courriels promotionnels sont facultatifs. Consultez la", "privacy note":"note de confidentialité", "This sends an order request for availability review.":"Cette action envoie une demande afin de vérifier la disponibilité.", "Send order request by email":"Envoyer la demande par courriel", "Your request is not a completed purchase. Please wait for a personal confirmation before sending an e-Transfer or preparing cash.":"Votre demande ne constitue pas un achat final. Attendez une confirmation personnelle avant d'envoyer un virement ou de préparer un paiement comptant.", "Local delivery is available within 20 km of Aylmer for a flat $10, or free on product orders of $75 or more.":"La livraison locale est offerte dans un rayon de 20 km d'Aylmer au tarif fixe de 10 $, ou gratuitement dès 75 $ de produits.", "Your request number is":"Votre numéro de demande est", "We sent you a receipt for the request. Just B Natural will check the items and send a separate confirmation before any payment is due.":"Nous vous avons envoyé un reçu de la demande. Just B Natural vérifiera les articles et vous enverra une confirmation distincte avant que tout paiement soit exigé.",
    "When you submit an order, Just B Natural receives the contact information and order details needed to confirm availability, payment, pickup, or delivery. This information is used to complete and discuss your order.":"Lorsque vous envoyez une demande, Just B Natural reçoit les coordonnées et les détails nécessaires pour confirmer la disponibilité, le paiement, le ramassage ou la livraison. Ces renseignements servent uniquement à traiter votre commande et à communiquer avec vous.", "You are added to the promotional email list only when you actively choose to subscribe. You can unsubscribe from promotional emails at any time. Placing an order does not automatically subscribe you.":"Vous êtes ajoutée ou ajouté à la liste promotionnelle seulement si vous choisissez de vous inscrire. Vous pouvez vous désabonner en tout temps. Une commande ne vous inscrit jamais automatiquement.", "For questions about your information, email":"Pour toute question au sujet de vos renseignements, écrivez à"
  }).forEach(([source, translation]) => text.set(source, translation));

  Object.entries({
    "See what’s new at":"Découvrez les nouveautés chez", "View @justb.naturals":"Voir @justb.naturals", "Your cart and contact details go to Just B Natural.":"Votre panier et vos coordonnées sont transmis à Just B Natural.", "You receive the final details and payment instructions by email.":"Vous recevez les détails finaux et les instructions de paiement par courriel.", "You receive payment and pickup or delivery details by email.":"Vous recevez les détails du paiement, du ramassage ou de la livraison par courriel.", "Order request":"Demande de commande", "How ordering works":"Comment fonctionne la commande", "The shop now has your latest inventory.":"La boutique affiche maintenant votre inventaire à jour.", "Saved. It’s live! ✓":"Enregistré. C'est en ligne! ✓",
    "Set the stock and price, choose Preorder only when a product is curing, then press Save changes or hit Enter. A stock number of 0 automatically shows Out of stock. Stock can stay blank when you do not want a number shown. Prices are in Canadian dollars.":"Définissez le stock et le prix. Choisissez Précommande seulement lorsqu'un produit est en cure, puis cliquez sur Enregistrer ou appuyez sur Entrée. Un stock de 0 affiche automatiquement Rupture de stock. Laissez le stock vide si vous ne souhaitez pas afficher de quantité. Les prix sont en dollars canadiens.", "Two simple choices":"Deux choix simples", "Available now":"Disponible maintenant", "Available now lets customers order whenever stock is above 0. Preorder shows the ready date and allows advance orders. Setting stock to 0 automatically shows Out of stock.":"Disponible maintenant permet de commander lorsque le stock est supérieur à 0. Précommande affiche la date de disponibilité et permet de réserver à l'avance. Un stock de 0 affiche automatiquement Rupture de stock.", "Save with the button or press Enter. Changes appear on the shop immediately.":"Enregistrez avec le bouton ou appuyez sur Entrée. Les changements paraissent aussitôt dans la boutique.", "Price (CAD)":"Prix (CAD)", "The shop now has your latest inventory.":"La boutique affiche maintenant votre inventaire à jour.",
    "Special instructions, allergies, preferred timing, or a gift note":"Instructions particulières, allergies, moment préféré ou note-cadeau", "Search products or ingredients":"Rechercher un produit ou un ingrédient", "Search soaps or ingredients":"Rechercher un savon ou un ingrédient", "Search scrubs or ingredients":"Rechercher un exfoliant ou un ingrédient", "Search roll-on oils or ingredients":"Rechercher une huile à bille ou un ingrédient", "Search body care or ingredients":"Rechercher un soin ou un ingrédient", "Search home and linen products or ingredients":"Rechercher un produit pour la maison ou un ingrédient", "Search home and linen products…":"Rechercher pour la maison…", "Search products or ingredients…":"Rechercher un produit ou un ingrédient…", "Search soaps or ingredients…":"Rechercher un savon ou un ingrédient…", "Search scrubs or ingredients…":"Rechercher un exfoliant ou un ingrédient…", "Search roll-on oils or ingredients…":"Rechercher une huile à bille ou un ingrédient…", "Search body care or ingredients…":"Rechercher un soin ou un ingrédient…",
    "Remove":"Retirer", "Please correct the highlighted information before sending your request.":"Veuillez corriger les renseignements indiqués avant d'envoyer votre demande.", "Order could not be sent.":"La demande n'a pas pu être envoyée.", "We could not send the request automatically. You can send the prepared request by email instead.":"Nous n'avons pas pu envoyer la demande automatiquement. Vous pouvez utiliser le courriel préparé à la place.", "Saving your notification…":"Enregistrement de l'avis…", "You’re all set. Check your inbox for confirmation.":"C'est fait. Vérifiez votre boîte de réception.", "Enter a complete email address, such as name@example.com.":"Entrez une adresse courriel complète, par exemple nom@exemple.com.", ". We sent you a receipt for the request. Just B Natural will check the items and send a separate confirmation before any payment is due.":". Nous vous avons envoyé un reçu de la demande. Just B Natural vérifiera les articles et vous enverra une confirmation distincte avant que tout paiement soit exigé.",
    "More from Artisan Soaps":"Plus de savons artisanaux", "More from Sugar Scrubs":"Plus d'exfoliants au sucre", "More from Botanical Oils":"Plus d'huiles botaniques", "More from Roll-On Oils":"Plus d'huiles botaniques", "More from Body Care":"Plus de soins corporels", "More from Home & Linen":"Plus de produits pour la maison et le linge"
  }).forEach(([source, translation]) => text.set(source, translation));

  const patternTranslations = [
    [/^(\d+) products available • (\d+) available for preorder$/, "$1 produits disponibles • $2 en précommande"],
    [/^(\d+) product available • (\d+) available for preorder$/, "$1 produit disponible • $2 en précommande"],
    [/^(\d+) products available$/, "$1 produits disponibles"], [/^(\d+) product available$/, "$1 produit disponible"],
    [/^(\d+) available for preorder$/, "$1 en précommande"], [/^(\d+) products$/, "$1 produits"], [/^(\d+) product$/, "$1 produit"],
    [/^(\d+) in stock$/i, "$1 en stock"], [/^Available (.+)$/i, "Disponible le $1"], [/^Preorder • Available (.+)$/i, "Précommande • Disponible le $1"],
    [/^More from (.+)$/i, "Plus de produits: $1"], [/^Add another \((\d+)\)$/i, "En ajouter un ($1)"], [/^(\d+) items$/, "$1 articles"], [/^(\d+) item$/, "$1 article"],
    [/^View (.+)$/i, "Voir $1"], [/^Quantity for (.+)$/i, "Quantité de $1"], [/^Remove one (.+)$/i, "Retirer un $1"], [/^Add one (.+)$/i, "Ajouter un $1"], [/^(.+) added to your cart\.$/i, "$1 a été ajouté au panier."], [/^Currently expected (.+)\.$/i, "Disponibilité prévue le $1."]
  ];

  function useNaturalWording(value) {
    return String(value)
      .replaceAll("Sans parfum", "Au naturel")
      .replaceAll("sans parfum", "au naturel")
      .replaceAll("Des parfums composés", "Des arômes composés")
      .replaceAll("de parfums et", "de senteurs et")
      .replaceAll("les parfums du moment", "les senteurs du moment")
      .replaceAll("parfums aux huiles essentielles", "senteurs aux huiles essentielles")
      .replaceAll("les ingrédients et les parfums", "les ingrédients et les senteurs")
      .replaceAll("Ingrédients, parfums et réponses", "Ingrédients, senteurs et réponses")
      .replaceAll("Les parfums", "Les senteurs")
      .replaceAll("Nos savons parfumés sont composés", "Nos savons aux huiles essentielles sont composés")
      .replaceAll("plutôt que de parfums synthétiques", "plutôt que d'arômes synthétiques")
      .replaceAll("Quels parfums utilisez-vous?", "Quelles senteurs utilisez-vous?")
      .replaceAll("Nos produits parfumés utilisent", "Nos produits aromatiques utilisent")
      .replaceAll("de parfums synthétiques", "d'arômes synthétiques")
      .replaceAll("un léger parfum d'agrumes", "une légère senteur d'agrumes")
      .replaceAll("un parfum naturel", "un arôme naturel")
      .replaceAll("Parfumées", "Aromatiques")
      .replaceAll("parfumées", "aromatiques")
      .replaceAll("Parfumés", "Aromatiques")
      .replaceAll("parfumés", "aromatiques")
      .replaceAll("Parfumée", "Aromatique")
      .replaceAll("parfumée", "aromatique")
      .replaceAll("Parfumé", "Aromatique")
      .replaceAll("parfumé", "aromatique")
      .replaceAll("Parfums", "Senteurs")
      .replaceAll("parfums", "senteurs")
      .replaceAll("Parfum", "Senteur")
      .replaceAll("parfum", "senteur");
  }

  function translateValue(value) {
    const clean = String(value || "").trim();
    if (!clean) return value;
    if (text.has(clean)) return useNaturalWording(text.get(clean));
    for (const [pattern, replacement] of patternTranslations) if (pattern.test(clean)) return useNaturalWording(clean.replace(pattern, replacement));
    return useNaturalWording(value);
  }

  function translateTree(root = document.body) {
    if (!isFrench || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.parentElement?.closest("script, style")) return;
      const before = node.nodeValue;
      const leading = before.match(/^\s*/)?.[0] || "";
      const trailing = before.match(/\s*$/)?.[0] || "";
      const translated = translateValue(before);
      if (translated !== before) node.nodeValue = leading + translated + trailing;
    });
    root.querySelectorAll?.("[placeholder], [aria-label], [title]").forEach(element => {
      ["placeholder", "aria-label", "title"].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const value = element.getAttribute(attribute);
        const translated = translateValue(value);
        if (translated !== value) element.setAttribute(attribute, translated);
      });
    });
  }

  function localizedHref(language) {
    const url = new URL(location.href);
    if (language === "fr") url.searchParams.set("lang", "fr"); else url.searchParams.delete("lang");
    return `${url.pathname.split("/").pop() || "index.html"}${url.search}${url.hash}`;
  }

  function preserveLanguage(root = document) {
    if (!isFrench) return;
    root.querySelectorAll?.("a[href]").forEach(link => {
      const raw = link.getAttribute("href");
      if (!raw || link.matches(".language-toggle") || link.hasAttribute("hreflang") || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("http")) return;
      const url = new URL(raw, location.href);
      url.searchParams.set("lang", "fr");
      link.setAttribute("href", `${url.pathname.split("/").pop()}${url.search}${url.hash}`);
    });
  }

  function addToggle() {
    const label = isFrench ? "EN" : "FR";
    const language = isFrench ? "en" : "fr";
    const title = isFrench ? "View this page in English" : "Voir cette page en français";
    const link = `<a class="language-toggle" href="${localizedHref(language)}" lang="${language}" hreflang="${language}" aria-label="${title}">${label}</a>`;
    const actions = document.querySelector(".header-actions");
    if (actions && !actions.querySelector(".language-toggle")) actions.insertAdjacentHTML("beforeend", link);
    const headerInner = document.querySelector(".header-inner");
    if (headerInner && !headerInner.querySelector(".language-toggle-mobile")) headerInner.insertAdjacentHTML("beforeend", link.replace("language-toggle\"", "language-toggle language-toggle-mobile\""));
    const inventoryHeader = document.querySelector(".inventory-header");
    if (inventoryHeader && !inventoryHeader.querySelector(".language-toggle")) inventoryHeader.insertAdjacentHTML("beforeend", link);
  }

  function localizeTitle() {
    if (!isFrench) return;
    const titles = { home:"Soins naturels en petites quantités", shop:"Tous les produits", "artisan-soap":"Savons artisanaux", "sugar-scrubs":"Exfoliants au sucre", "roller-oils":"Huiles à bille", "body-care":"Soins corporels", "home-linen":"Maison et linge", about:"À propos", faq:"Ingrédients et FAQ", checkout:"Demande de commande", privacy:"Confidentialité", "gift-sets":"Ensembles cadeaux", "local-pickup":"Ramassage et livraison à Gatineau", "october-rose":"Octobre rose" };
    const value = titles[document.body.dataset.page];
    document.title = `${value || (document.body.classList.contains("inventory-page") ? "Inventaire" : "Produit")} | Just B Natural`;
  }

  function initialize() {
    addToggle();
    if (!isFrench) return;
    document.documentElement.lang = "fr";
    translateTree();
    preserveLanguage();
    localizeTitle();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; translateTree(); preserveLanguage(); });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  globalThis.JBN_FR = { isFrench, prepare, translateTree };
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
})();
