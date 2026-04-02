import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  commonNames?: string;
  category: string;
  light: string;
  water: string;
  temperature?: string;
  humidity?: string;
  soil?: string;
  growthRate?: string;
  matureSize?: string;
  difficulty: number;
  description?: string;
  careTips?: string;
  toxicity?: string;
  benefits?: string;
  imageUrl?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  balconyJson?: string;
  designJson?: string;
  location?: string;
  area?: number;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PlantContextType {
  plants: Plant[];
  projects: Project[];
  loading: boolean;
  fetchPlants: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  createProject: (project: any) => Promise<void>;
  addPlantToProject: (projectId: string, plantId: string, quantity?: number) => Promise<void>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};

export const PlantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = async () => {
    try {
      const response = await axios.get('/api/plants');
      setPlants(response.data);
    } catch (error) {
      console.error('Failed to fetch plants:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createProject = async (project: any) => {
    try {
      const response = await axios.post('/api/projects', project);
      setProjects([...projects, response.data]);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const addPlantToProject = async (projectId: string, plantId: string, quantity = 1) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/plants`, {
        plantId,
        quantity,
      });
      
      // Update the project in local state
      setProjects(projects.map(project => 
        project.id === projectId ? response.data : project
      ));
    } catch (error) {
      console.error('Failed to add plant to project:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchPlants();
      await fetchProjects();
      setLoading(false);
    };
    
    fetchInitialData();
  }, []);

  return (
    <PlantContext.Provider value={{
      plants,
      projects,
      loading,
      fetchPlants,
      fetchProjects,
      createProject,
      addPlantToProject,
    }}>
      {children}
    </PlantContext.Provider>
  );
};