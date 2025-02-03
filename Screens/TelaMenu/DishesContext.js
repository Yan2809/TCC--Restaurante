// DishesContext.js
import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

export const DishesContext = createContext();

export const DishesProvider = ({ children }) => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'products'));
        const dishList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDishes(dishList);
      } catch (error) {
        console.error("Error fetching dishes: ", error);
      }
    };
    fetchDishes();
  }, []);

  const addDish = async (newDish) => {
    try {
      const newDishRef = await addDoc(collection(firestore, 'products'), newDish);
      setDishes([...dishes, { id: newDishRef.id, ...newDish }]);
    } catch (error) {
      console.error("Error adding new dish: ", error);
    }
  };

  return (
    <DishesContext.Provider value={{ dishes, addDish }}>
      {children}
    </DishesContext.Provider>
  );
};
