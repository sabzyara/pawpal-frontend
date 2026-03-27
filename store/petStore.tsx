import { createContext, useContext, useState } from "react";

type PetContextType = {
  pets: string[];
  addPet: (name: string) => void;
};

const PetContext = createContext<PetContextType | null>(null);

export function PetProvider({ children }: any) {
  const [pets, setPets] = useState<string[]>([]);

  const addPet = (name: string) => {
    setPets((prev) => [...prev, name]);
  };

  return (
    <PetContext.Provider value={{ pets, addPet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetContext);
  if (!context) throw new Error("usePets must be used inside PetProvider");
  return context;
}
