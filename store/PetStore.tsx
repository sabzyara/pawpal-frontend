import { createContext, useContext, useState } from "react";

type Pet = {
  id: number;
  name: string;
};

type PetContextType = {
  pets: Pet[];
  addPet: (pet: Pet) => void;
  setPets: (pets: Pet[]) => void;
};

const PetContext = createContext<PetContextType | null>(null);

export function PetProvider({ children }: any) {
  const [pets, setPets] = useState<Pet[]>([]);

  const addPet = (pet: Pet) => {
    setPets((prev) => [...prev, pet]);
  };

  return (
    <PetContext.Provider value={{ pets, addPet, setPets }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetContext);
  if (!context) throw new Error("usePets must be used inside PetProvider");
  return context;
}