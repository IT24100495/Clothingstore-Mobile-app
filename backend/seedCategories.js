const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const categories = [
  { name: "Men's Clothing", description: "Clothing for men", gender: "Men", isActive: true },
  { name: "Women's Clothing", description: "Clothing for women", gender: "Women", isActive: true },
  { name: "Kids' Clothing", description: "Clothing for kids", gender: "Kids", isActive: true },
  { name: "Accessories", description: "Bags, belts, hats and more", gender: "Unisex", isActive: true },
  { name: "Men's Shoes", description: "Footwear for men", gender: "Men", isActive: true },
  { name: "Women's Shoes", description: "Footwear for women", gender: "Women", isActive: true },
  { name: "Sportswear", description: "Athletic and sports clothing", gender: "Unisex", isActive: true },
  { name: "Winter Wear", description: "Jackets, coats and warm clothing", gender: "Unisex", isActive: true },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (exists) {
        console.log(`⏭️  Already exists: ${cat.name}`);
      } else {
        await Category.create(cat);
        console.log(`✅ Created: ${cat.name}`);
      }
    }

    console.log('\n🎉 All categories seeded successfully!');
    console.log('You can now add products and select these categories.');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedCategories();