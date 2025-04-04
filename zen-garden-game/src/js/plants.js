class Plant {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.growthStage = 1; // 1 to 5 (increased from 3)
        this.element = null;
        this.needsWater = true;
        
        // Set plant-specific properties
        switch(type) {
            case 'bonsai':
                this.maxGrowthStages = 5; // Increased from 3
                this.growthTime = 10000; // ms
                break;
            case 'bamboo':
                this.maxGrowthStages = 5; // Increased from 3
                this.growthTime = 8000;
                break;
            case 'rock':
                this.maxGrowthStages = 1; // Rocks don't grow
                this.growthTime = 0;
                break;
            case 'flower':
                this.maxGrowthStages = 5; // Increased from 3
                this.growthTime = 5000;
                break;
        }
    }
    
    render() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.classList.add('plant');
            this.element.dataset.type = this.type; // Add data-type attribute for CSS selection
            this.element.style.left = `${this.x - 30}px`;
            this.element.style.top = `${this.y - 30}px`;
            this.updateAppearance();
        }
        return this.element;
    }
    
    updateAppearance() {
        if (!this.element) return;
        
        // Update growth class - now includes 5 stages
        this.element.classList.remove('growth-1', 'growth-2', 'growth-3', 'growth-4', 'growth-5');
        this.element.classList.add(`growth-${this.growthStage}`);
        
        // Also update the needsWater state visually
        if (this.needsWater) {
            this.element.classList.add('needs-water');
        } else {
            this.element.classList.remove('needs-water');
        }
    }
    
    water() {
        if (this.growthStage < this.maxGrowthStages) {
            this.element.classList.add('watering');
            
            setTimeout(() => {
                this.growthStage++;
                this.updateAppearance();
                this.element.classList.remove('watering');
                this.element.classList.add('plant-grow');
                this.needsWater = false;
                
                // After growth animation completes
                setTimeout(() => {
                    this.element.classList.remove('plant-grow');
                    // Plants need water after growing
                    if (this.growthStage < this.maxGrowthStages) {
                        this.needsWater = true;
                    }
                }, 2000);
            }, 1000);
            
            return true;
        }
        return false;
    }

    trim() {
        if (this.growthStage > 1) {
            this.element.classList.add('styling');
            
            setTimeout(() => {
                this.growthStage--;
                this.updateAppearance();
                this.element.classList.remove('styling');
                this.needsWater = false;
            }, 500);
            
            return true;
        }
        return false;
    }
}

export default Plant;