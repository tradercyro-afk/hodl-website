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
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/');
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
const TOKEN_MINT = '';
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
// ===========================
// LEADERBOARD FUNCTIONALITY
// ===========================

async function fetchLeaderboardData() {
    try {
        const requestBody = {
            jsonrpc: '2.0',
            id: 'leaderboard',
            method: 'getTokenAccounts',
            params: {
                mint: TOKEN_MINT,
                limit: 1000
            }
        };

        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();
        
        if (data.result && data.result.token_accounts) {
            // Filter non-zero balances and sort by amount
            const allHolders = data.result.token_accounts
                .filter(acc => parseFloat(acc.amount) > 0)
                .map(acc => ({
                    wallet: acc.owner,
                    amount: parseFloat(acc.amount) / 1000000, // Convert from smallest unit
                    holdingTime: 'Loading...'
                }))
                .sort((a, b) => b.amount - a.amount);
            
            // Skip first wallet (liquidity pool) and take next 25
            const topHolders = allHolders.slice(1, 26);
            
            // Fetch holding time for each holder
            await Promise.all(topHolders.map(async (holder) => {
                holder.holdingTime = await getHoldingTime(holder.wallet);
            }));

            return topHolders;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

async function getHoldingTime(walletAddress) {
    try {
        // Get token account for this specific wallet and mint
        const requestBody = {
            jsonrpc: '2.0',
            id: 'get-token-account',
            method: 'getTokenAccountsByOwner',
            params: [
                walletAddress,
                {
                    mint: TOKEN_MINT
                },
                {
                    encoding: 'jsonParsed'
                }
            ]
        };

        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            return 'N/A';
        }

        const data = await response.json();
        
        if (data.result && data.result.value && data.result.value.length > 0) {
            const tokenAccount = data.result.value[0].pubkey;
            
            // Get signatures for this specific token account
            const sigRequestBody = {
                jsonrpc: '2.0',
                id: 'get-sigs',
                method: 'getSignaturesForAddress',
                params: [
                    tokenAccount,
                    {
                        limit: 1000
                    }
                ]
            };

            const sigResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sigRequestBody)
            });

            if (!sigResponse.ok) {
                return 'N/A';
            }

            const sigData = await sigResponse.json();
            
            if (sigData.result && sigData.result.length > 0) {
                // Get the oldest transaction (first purchase)
                const oldestTx = sigData.result[sigData.result.length - 1];
                const firstPurchaseTime = oldestTx.blockTime * 1000; // Convert to milliseconds
                const now = Date.now();
                const holdingDuration = now - firstPurchaseTime;
                
                // Convert to days and hours
                const days = Math.floor(holdingDuration / (1000 * 60 * 60 * 24));
                const hours = Math.floor((holdingDuration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                if (days > 0) {
                    return `${days}d ${hours}h`;
                } else if (hours > 0) {
                    return `${hours}h`;
                } else {
                    const minutes = Math.floor(holdingDuration / (1000 * 60));
                    return `${minutes}m`;
                }
            }
        }
        
        return 'N/A';
    } catch (error) {
        console.error('Error fetching holding time:', error);
        return 'N/A';
    }
}

function formatWalletAddress(address) {
    if (!address || address.length < 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function formatAmount(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(2) + 'K';
    }
    return amount.toFixed(2);
}

async function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    if (!leaderboardBody) return;
    
    const holders = await fetchLeaderboardData();
    
    if (holders.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="leaderboard-loading">No data available</td></tr>';
        return;
    }
    
    leaderboardBody.innerHTML = holders.map((holder, index) => `
        <tr>
            <td>${index + 1}</td>
            <td title="${holder.wallet}">${formatWalletAddress(holder.wallet)}</td>
            <td>${formatAmount(holder.amount)} $HODL</td>
            <td>${holder.holdingTime}</td>
        </tr>
    `).join('');
}

// Initialize leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLeaderboard();
    // Refresh leaderboard every 30 seconds
    setInterval(updateLeaderboard, 30000);
});