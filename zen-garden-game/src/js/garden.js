import Plant from './plants.js';
import Panda from './panda.js';

class Garden {
    constructor(element) {
        this.element = element;
        this.width = element.clientWidth;
        this.height = element.clientHeight;
        this.plants = [];
        this.zenLevel = 20; // start at 20%
        this.zenMeterElement = document.querySelector('.zen-fill');
        
        // Add panda
        this.panda = new Panda(this);
        this.element.appendChild(this.panda.render());
        
        // Start panda movement after a short delay
        setTimeout(() => {
            this.panda.startMoving();
        }, 2000);
        
        // Update Zen meter
        this.updateZenMeter();
    }
    
    addPlant(type, x, y) {
        // Check if position is already occupied
        const plantSize = 60;
        const buffer = 10;
        
        for (const plant of this.plants) {
            const distance = Math.sqrt(Math.pow(plant.x - x, 2) + Math.pow(plant.y - y, 2));
            if (distance < plantSize + buffer) {
                return null; // Too close to another plant
            }
        }
        
        // Create and add the plant
        const plant = new Plant(type, x, y);
        this.plants.push(plant);
        this.element.appendChild(plant.render());
        
        // Increase zen level
        this.addZen(5);
        
        return plant;
    }
    
    waterPlant(x, y) {
        const plant = this.getPlantAt(x, y);
        // Allow watering if plant is not at max growth, even if it doesn't "need" water
        if (plant && plant.growthStage < plant.maxGrowthStages) {
            const success = plant.water();
            if (success) {
                this.addZen(3);
            }
            return success;
        }
        return false;
    }
    
    getPlantAt(x, y) {
        for (const plant of this.plants) {
            // Simple hit detection - check if click is within plant bounds
            // Use a scaling factor based on the growth stage (12px per growth level)
            const plantSize = 12 * plant.growthStage;
            if (
                x >= plant.x - plantSize &&
                x <= plant.x + plantSize &&
                y >= plant.y - plantSize &&
                y <= plant.y + plantSize
            ) {
                return plant;
            }
        }
        return null;
    }
    
    addZen(amount) {
        this.zenLevel = Math.min(100, this.zenLevel + amount);
        this.updateZenMeter();
    }
    
    updateZenMeter() {
        this.zenMeterElement.style.width = `${this.zenLevel}%`;
    }

    trimPlant(x, y) {
        const plant = this.getPlantAt(x, y);
        if (plant && plant.growthStage > 1) {
            const success = plant.trim();
            if (success) {
                this.addZen(2);
            }
            return success;
        }
        return false;
    }
}

export default Garden;