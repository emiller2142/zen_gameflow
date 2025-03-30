class Panda {
    constructor(garden) {
        this.garden = garden;
        this.x = Math.random() * garden.width;
        this.y = Math.random() * garden.height;
        this.size = 1; // Starting size scale factor
        this.element = null;
        this.speed = 2;
        this.targetX = null;
        this.targetY = null;
        this.updateTargetTimeout = null;
        this.eatTimeout = null;
    }
    
    render() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.classList.add('panda');
            this.element.style.left = `${this.x - 30}px`;
            this.element.style.top = `${this.y - 30}px`;
            this.updateAppearance();
        }
        return this.element;
    }
    
    updateAppearance() {
        if (!this.element) return;
        
        // Update size - store the size as a CSS variable for animations
        this.element.style.setProperty('--panda-size', this.size);
        this.element.style.transform = `scale(${this.size})`;
    }
    
    startMoving() {
        this.updateTarget();
        this.move();
    }
    
    updateTarget() {
        // Clear existing timeout
        if (this.updateTargetTimeout) {
            clearTimeout(this.updateTargetTimeout);
        }
        
        // 80% chance to move randomly, 20% chance to target a plant
        if (Math.random() < 0.8 || this.garden.plants.length === 0) {
            // Random movement
            this.targetX = Math.random() * this.garden.width;
            this.targetY = Math.random() * this.garden.height;
        } else {
            // Target a random plant
            const randomPlant = this.garden.plants[Math.floor(Math.random() * this.garden.plants.length)];
            this.targetX = randomPlant.x;
            this.targetY = randomPlant.y;
        }
        
        // Update target again in 3-8 seconds
        const nextUpdateTime = 3000 + Math.random() * 5000;
        this.updateTargetTimeout = setTimeout(() => this.updateTarget(), nextUpdateTime);
    }
    
    move() {
        if (!this.element) return;
        
        // Calculate direction to target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // Close enough to target, check for plants to eat
            this.checkForPlants();
            return;
        }
        
        // Normalize direction and add some randomness
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        // Add slight randomness to movement for hopping effect
        const randomFactor = 0.3;
        const randomX = (Math.random() * 2 - 1) * randomFactor;
        const randomY = (Math.random() * 2 - 1) * randomFactor;
        
        // Move panda
        this.x += (normalizedDx + randomX) * this.speed;
        this.y += (normalizedDy + randomY) * this.speed;
        
        // Keep panda within garden boundaries
        this.x = Math.max(30, Math.min(this.garden.width - 30, this.x));
        this.y = Math.max(30, Math.min(this.garden.height - 30, this.y));
        
        // Update position
        this.element.style.left = `${this.x - 30}px`;
        this.element.style.top = `${this.y - 30}px`;
        
        // Add hopping animation occasionally
        if (Math.random() < 0.05) {
            this.element.classList.add('hopping');
            setTimeout(() => {
                this.element.classList.remove('hopping');
            }, 500);
        }
        
        // Continue moving
        requestAnimationFrame(() => this.move());
    }
    
    checkForPlants() {
        const plant = this.garden.getPlantAt(this.x, this.y);
        
        if (plant) {
            this.eat(plant);
        } else {
            // No plant to eat, keep moving
            this.updateTarget();
            this.move();
        }
    }
    
    eat(plant) {
        // Can't eat while already eating
        if (this.eatTimeout) return;
        
        this.element.classList.add('eating');
        
        this.eatTimeout = setTimeout(() => {
            // Apply effects based on plant type
            if (plant.type === 'rock') {
                // Hitting a rock makes panda smaller
                this.size = Math.max(0.5, this.size * 0.8);
            } else {
                // Eating plants makes panda bigger
                this.size = Math.min(3, this.size * 1.2);
                
                // Decrease zen level
                this.garden.addZen(-5);
                
                // Reduce plant growth stage or destroy if at stage 1
                if (plant.growthStage === 1) {
                    // Remove plant from garden
                    const index = this.garden.plants.indexOf(plant);
                    if (index > -1) {
                        this.garden.plants.splice(index, 1);
                    }
                    
                    // Remove from DOM
                    if (plant.element && plant.element.parentNode) {
                        plant.element.parentNode.removeChild(plant.element);
                    }
                } else {
                    // Reduce growth stage
                    plant.growthStage--;
                    plant.updateAppearance();
                }
            }
            
            this.updateAppearance();
            this.element.classList.remove('eating');
            this.eatTimeout = null;
            
            // Continue moving
            this.updateTarget();
            this.move();
        }, 1000);
    }
}

export default Panda;