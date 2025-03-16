// This file contains the main game logic. It initializes the game, handles user interactions, and manages the game state.
import Garden from './garden.js';
import Plant from './plants.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize game variables
    const gardenElement = document.getElementById('garden');
    const garden = new Garden(gardenElement);
    let selectedTool = 'plant';
    let selectedPlant = 'bonsai';
    
    // Tool selection
    const toolElements = document.querySelectorAll('.tool');
    toolElements.forEach(tool => {
        tool.addEventListener('click', () => {
            // Update UI
            toolElements.forEach(t => t.classList.remove('selected'));
            tool.classList.add('selected');
            
            // Update selected tool
            selectedTool = tool.getAttribute('data-tool');
            
            // Show/hide plant selector if plant tool is selected
            const plantSelector = document.querySelector('.plant-selector');
            if (selectedTool === 'plant') {
                plantSelector.style.display = 'flex';
            } else {
                plantSelector.style.display = 'none';
            }
        });
    });
    
    // Plant selection
    const plantOptionElements = document.querySelectorAll('.plant-option');
    plantOptionElements.forEach(option => {
        option.addEventListener('click', () => {
            plantOptionElements.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedPlant = option.getAttribute('data-plant');
        });
    });
    
    // Garden interaction
    gardenElement.addEventListener('click', (event) => {
        const rect = gardenElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        switch (selectedTool) {
            case 'plant':
                garden.addPlant(selectedPlant, x, y);
                break;
            case 'water':
                garden.waterPlant(x, y);
                break;
            case 'shears':
                garden.trimPlant(x, y);
                break;
        }
    });
    
    // Simulate plants needing water occasionally
    setInterval(() => {
        const randomIndex = Math.floor(Math.random() * garden.plants.length);
        if (garden.plants[randomIndex] && garden.plants[randomIndex].growthStage < garden.plants[randomIndex].maxGrowthStages) {
            garden.plants[randomIndex].needsWater = true;
        }
    }, 10000);
    
    // Add refresh game functionality
    const refreshButton = document.getElementById('refresh-game');
    refreshButton.addEventListener('click', () => {
        // Remove all plants from the garden
        while (garden.plants.length > 0) {
            const plant = garden.plants.pop();
            if (plant.element && plant.element.parentNode) {
                plant.element.parentNode.removeChild(plant.element);
            }
        }
        
        // Reset zen level to starting value
        garden.zenLevel = 20;
        garden.updateZenMeter();
        
        // Reset tool selection
        toolElements.forEach(t => t.classList.remove('selected'));
        document.querySelector('[data-tool="plant"]').classList.add('selected');
        selectedTool = 'plant';
        
        // Show plant selector
        const plantSelector = document.querySelector('.plant-selector');
        plantSelector.style.display = 'flex';
        
        // Reset plant selection
        plantOptionElements.forEach(o => o.classList.remove('selected'));
        document.querySelector('[data-plant="bonsai"]').classList.add('selected');
        selectedPlant = 'bonsai';
    });
});