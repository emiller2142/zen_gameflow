class Plant {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.growthStage = 1; // 1 to 3
        this.element = null;
        this.needsWater = false;
        
        // Set plant-specific properties
        switch(type) {
            case 'bonsai':
                this.maxGrowthStages = 3;
                this.growthTime = 10000; // ms
                break;
            case 'bamboo':
                this.maxGrowthStages = 3;
                this.growthTime = 8000;
                break;
            case 'rock':
                this.maxGrowthStages = 1; // Rocks don't grow
                this.growthTime = 0;
                break;
            case 'flower':
                this.maxGrowthStages = 3;
                this.growthTime = 5000;
                break;
        }
    }
    
    render() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.classList.add('plant');
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
            this.updateAppearance();
        }
        return this.element;
    }
    
    updateAppearance() {
        if (!this.element) return;
        
        // Update growth class
        this.element.classList.remove('growth-1', 'growth-2', 'growth-3');
        this.element.classList.add(`growth-${this.growthStage}`);
        
        // Update image - now using .webp format
        this.element.style.backgroundImage = `url('assets/sprites/${this.type}-${this.growthStage}.webp')`;
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