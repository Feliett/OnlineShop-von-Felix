import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  { id: 1, name: "Herren T-Shirt", category: "Bekleidung", price: 19.99, sizes: ["S", "M", "L", "XL"], description: "Komfortables Baumwoll-T-Shirt", image: "/images/tshirt.jpg" },
  { id: 2, name: "Damen Uhr", category: "Uhren", price: 120.00, description: "Elegante Armbanduhr mit Lederband", image: "/images/watch.jpg" },
  { id: 3, name: "Sneaker", category: "Schuhe", price: 79.99, sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"], description: "Sportliche Sneaker für den Alltag", image: "/images/sneaker.jpg" }
];

const priceRanges = [
  { label: "0-9,99", min: 0, max: 9.99 },
  { label: "10-19,99", min: 10, max: 19.99 },
  { label: "20-49,99", min: 20, max: 49.99 },
  { label: "50-99,99", min: 50, max: 99.99 },
  { label: "100-199,99", min: 100, max: 199.99 },
  { label: "200-499,99", min: 200, max: 499.99 }
];

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  const addToCart = (product) => {
    if (selectedSize || !product.sizes) {
      setCart([...cart, { ...product, size: selectedSize }]);
      setSelectedProduct(null);
    } else {
      alert("Bitte eine Größe wählen.");
    }
  };

  const filterProducts = () => {
    return products.filter(product => 
      (!selectedCategory || product.category === selectedCategory) &&
      (!selectedPriceRange || (product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max))
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setSelectedCategory(null)}>Mein Shop</h1>
        <ShoppingCart className="w-6 h-6 cursor-pointer" />
      </div>

      <div className="flex space-x-4 mb-4">
        {["Bekleidung", "Uhren", "Schuhe", "Schmuck"].map(category => (
          <Button key={category} onClick={() => setSelectedCategory(category)}>{category}</Button>
        ))}
        <select onChange={(e) => setSelectedPriceRange(priceRanges.find(p => p.label === e.target.value))}>
          <option value="">Preis filtern</option>
          {priceRanges.map(range => (
            <option key={range.label} value={range.label}>{range.label} €</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filterProducts().map(product => (
          <Card key={product.id} onClick={() => setSelectedProduct(product)}>
            <CardContent>
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
              <h2>{product.name}</h2>
              <p>{product.price.toFixed(2)} €</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={() => setSelectedProduct(null)}>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-lg w-96 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2" onClick={() => setSelectedProduct(null)}><X /></button>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-40 object-cover" />
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <p>{selectedProduct.price.toFixed(2)} €</p>
            {selectedProduct.sizes && (
              <select onChange={(e) => setSelectedSize(e.target.value)}>
                <option value="">Größe wählen</option>
                {selectedProduct.sizes.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            )}
            <Button onClick={() => addToCart(selectedProduct)}>In den Warenkorb</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
