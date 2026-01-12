// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 100;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Info Bar Copy Functionality
const infoItem = document.querySelector('.info-item[data-full-address]');
const copyTooltip = document.querySelector('.copy-tooltip');

if (infoItem) {
    infoItem.addEventListener('click', async () => {
        const fullAddress = infoItem.getAttribute('data-full-address');
        
        try {
            await navigator.clipboard.writeText(fullAddress);
            copyTooltip.classList.add('show');
            
            setTimeout(() => {
                copyTooltip.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
}

// Fetch Market Cap from Dexscreener
async function fetchMarketCap() {
    try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/BbAD1w6UWRnLMu1hUxy5gvZhGwWiBh8JczwuTDtYpump');
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            const mcap = pair.marketCap;
            
            if (mcap) {
                // Format market cap
                let formatted;
                if (mcap >= 1000000) {
                    formatted = '$' + (mcap / 1000000).toFixed(2) + 'M';
                } else if (mcap >= 1000) {
                    formatted = '$' + (mcap / 1000).toFixed(2) + 'K';
                } else {
                    formatted = '$' + mcap.toFixed(0);
                }
                return formatted;
            }
        }
        return '---';
    } catch (error) {
        console.error('Error fetching market cap:', error);
        return '---';
    }
}

async function updateMarketCap() {
    const mcapElement = document.getElementById('mcap');
    if (!mcapElement) return;
    
    const mcap = await fetchMarketCap();
    mcapElement.textContent = mcap;
}

// Live Solana Token Holder Count
const TOKEN_MINT = 'BbAD1w6UWRnLMu1hUxy5gvZhGwWiBh8JczwuTDtYpump';
const HELIUS_API_KEY = '02135807-dd1a-41f0-be2c-8ae2c389ffb6';
const UPDATE_INTERVAL = 15000; // 15 seconds

async function fetchHolderCount() {
    try {
        // Use Helius to get accurate count
        let totalHolders = 0;
        let cursor = null;
        let hasMore = true;
        let pageCount = 0;
        const maxPages = 10; // Limit to prevent too many API calls

        while (hasMore && pageCount < maxPages) {
            const requestBody = {
                jsonrpc: '2.0',
                id: 'holder-count',
                method: 'getTokenAccounts',
                params: {
                    mint: TOKEN_MINT,
                    limit: 1000
                }
            };

            if (cursor) {
                requestBody.params.cursor = cursor;
            }

            const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.result && data.result.token_accounts) {
                    // Count only accounts with non-zero balances
                    const nonZeroAccounts = data.result.token_accounts.filter(acc => {
                        const amount = parseFloat(acc.amount);
                        return amount > 0;
                    });
                    totalHolders += nonZeroAccounts.length;
                    pageCount++;

                    if (data.result.cursor && data.result.token_accounts.length === 1000) {
                        cursor = data.result.cursor;
                    } else {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
        }

        console.log(`Total holders found: ${totalHolders} (Pages fetched: ${pageCount})`);
        
        // If we hit the page limit and haven't finished, estimate remaining
        if (pageCount >= maxPages && hasMore) {
            console.log('Hit page limit - actual count may be higher');
        }
        
        return totalHolders > 0 ? totalHolders : 2990;
        
    } catch (error) {
        console.error('Error fetching holder count:', error);
        return 2990; // Fallback to known count from DexScreener
    }
}

function formatNumber(num) {
    if (num === null) return '---';
    return num.toLocaleString('en-US');
}

async function updateHolderCount() {
    const holderElement = document.getElementById('holderCount');
    const holdersInfoElement = document.getElementById('holders');
    
    if (!holderElement) return;
    
    const count = await fetchHolderCount();
    if (count !== null) {
        const oldCount = holderElement.textContent;
        const newCount = formatNumber(count);
        
        // Update both the main holder count and info bar
        if (oldCount !== newCount) {
            holderElement.classList.add('shake');
            setTimeout(() => holderElement.classList.remove('shake'), 500);
        }
        
        holderElement.textContent = newCount;
        
        // Update info bar holders value
        if (holdersInfoElement) {
            holdersInfoElement.textContent = newCount;
        }
        
        if (oldCount !== newCount && oldCount !== '---') {
            // Trigger shake animation
            holderElement.classList.add('shake');
            setTimeout(() => {
                holderElement.classList.remove('shake');
            }, 500);
        }
        
        holderElement.textContent = newCount;
    }
}

// Initial fetch
updateHolderCount();
updateMarketCap();

// Update every 15 seconds
setInterval(updateHolderCount, UPDATE_INTERVAL);
setInterval(updateMarketCap, UPDATE_INTERVAL);

// Carousel functionality
let currentSlide = 0;
const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-item');
const totalSlides = slides.length;
const slidesToShow = 3;

function moveCarousel(direction) {
    currentSlide += direction;
    
    // Loop around
    if (currentSlide < 0) {
        currentSlide = totalSlides - slidesToShow;
    } else if (currentSlide > totalSlides - slidesToShow) {
        currentSlide = 0;
    }
    
    updateCarousel();
}

function updateCarousel() {
    if (track) {
        const offset = -currentSlide * (100 / slidesToShow);
        track.style.transform = `translateX(${offset}%)`;
    }
}

// Auto-play carousel - slower rotation
let autoPlayInterval = setInterval(() => {
    moveCarousel(1);
}, 3000);

// Reset auto-play on manual navigation
document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            moveCarousel(1);
        }, 3000);
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe step cards
document.querySelectorAll('.step').forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(20px)';
    step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(step);
});
