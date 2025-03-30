class Panda {
    constructor(garden) {
        this.garden = garden;
        this.x = garden.width / 2; // Start in center
        this.y = garden.height / 2; // Start in center
        this.size = 1; // Starting size scale factor
        this.element = null;
        this.speed = 2;
        this.targetX = null;
        this.targetY = null;
        this.updateTargetTimeout = null;
        this.eatTimeout = null;
        this.stuckAtEdgeCounter = 0; // Counter to detect when panda is stuck at edges
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
        
        // Check if panda is near an edge
        const isNearEdge = this.x < 60 || this.x > this.garden.width - 60 || 
                          this.y < 60 || this.y > this.garden.height - 60;
        
        if (isNearEdge) {
            this.stuckAtEdgeCounter++;
        } else {
            this.stuckAtEdgeCounter = 0;
        }
        
        // Determine target selection strategy
        let strategy = 'random';
        
        // If stuck at edge, strongly bias toward center
        if (this.stuckAtEdgeCounter >= 3) {
            strategy = 'center';
            this.stuckAtEdgeCounter = 0; // Reset counter
        }
        // More likely to target plants (40% chance instead of 20%)
        else if (Math.random() < 0.4 && this.garden.plants.length > 0) {
            strategy = 'plant';
        }
        // If near edge, 60% chance to move toward center
        else if (isNearEdge && Math.random() < 0.6) {
            strategy = 'center';
        }
        
        // Apply the chosen strategy
        switch (strategy) {
            case 'center':
                // Move toward center of garden
                this.targetX = this.garden.width / 2 + (Math.random() * 100 - 50);
                this.targetY = this.garden.height / 2 + (Math.random() * 100 - 50);
                break;
                
            case 'plant':
                // Find nearest plants
                const plantsByDistance = [...this.garden.plants].sort((a, b) => {
                    const distA = Math.hypot(a.x - this.x, a.y - this.y);
                    const distB = Math.hypot(b.x - this.x, b.y - this.y);
                    return distA - distB;
                });
                
                // 70% chance to target one of the 3 closest plants, 30% chance for any random plant
                if (plantsByDistance.length > 0) {
                    let targetPlant;
                    if (plantsByDistance.length >= 3 && Math.random() < 0.7) {
                        // Choose from the 3 closest plants
                        const index = Math.floor(Math.random() * 3);
                        targetPlant = plantsByDistance[index];
                    } else {
                        // Choose any random plant
                        targetPlant = plantsByDistance[Math.floor(Math.random() * plantsByDistance.length)];
                    }
                    
                    this.targetX = targetPlant.x;
                    this.targetY = targetPlant.y;
                }
                break;
                
            case 'random':
            default:
                // Random point but biased away from edges
                const margin = 80;
                this.targetX = margin + Math.random() * (this.garden.width - 2 * margin);
                this.targetY = margin + Math.random() * (this.garden.height - 2 * margin);
                break;
        }
        
        // Update target again in 2-5 seconds (quicker decisions)
        const nextUpdateTime = 2000 + Math.random() * 3000;
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