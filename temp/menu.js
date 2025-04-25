
// Make sure projects.js exports projectsData and HeroSlider
// Make sure data.js exports slides
import { projectsData} from "../projects.js";
import { HeroSlider } from "../hero_slider.js";// Assuming HeroSlider is here too
import { slides } from '../data.js';

// --- GSAP Plugins and Custom Eases ---
gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create("hop", "0.9, 0, 0.1, 1");
CustomEase.create("hop2", "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1");

// --- Color Themes ---
const cardThemes = {
    "Spiderman No Way Home": { "--primary-color": "#330000", "--secondary-color": "#ffffff", "--accent-color": "#ff4d4d", "--slider-color": "#cc0000", "--bg-color": "#1a0000", "--primary-color-rgb": "51, 0, 0", "--split-color": "#1e0202" },
    "Interstellar": { "--primary-color": "#000000", "--secondary-color": "#ffffff", "--accent-color": "#cccccc", "--slider-color": "#ff4c00", "--bg-color": "#2a2a2a", "--primary-color-rgb": "0, 0, 0", "--split-color": "#080808" },
    "Aladdin": { "--primary-color": "#1a0033", "--secondary-color": "#ffffcc", "--accent-color": "#99ccff", "--slider-color": "#ffcc00", "--bg-color": "#330066", "--primary-color-rgb": "26, 0, 51", "--split-color": "#100020" },
    "Transformers One": { "--primary-color": "#1a1a1a", "--secondary-color": "#ffff00", "--accent-color": "#cccccc", "--slider-color": "#ff8000", "--bg-color": "#333333", "--primary-color-rgb": "26, 26, 26", "--split-color": "#0f0f0f" },
    "Iron Man": { "--primary-color": "#4d0000", "--secondary-color": "#ffff00", "--accent-color": "#ff4d4d", "--slider-color": "#ffcc00", "--bg-color": "#2a0000", "--primary-color-rgb": "77, 0, 0", "--split-color": "#2e0000" }
};
const genreToThemeMap = { "Action": "Spiderman No Way Home", "Sci-fi": "Interstellar", "Fantasy": "Aladdin", "Animation": "Transformers One", "Thriller": "Iron Man", "All": "Interstellar" };

// --- Function to apply a theme ---
function applyTheme(themeName) {
    const theme = cardThemes[themeName];
    const root = document.documentElement;
    const shadowElement = document.querySelector(".shadow"); // Query only when needed
    if (!theme) {
        console.warn(`Theme not found for: ${themeName}. Using default 'Interstellar' theme.`);
        applyTheme("Interstellar");
        return;
    }
    console.log(`Applying theme: ${themeName}`);
    gsap.to(root, {
        duration: 0.5, ease: "power1.inOut",
        '--primary-color': theme['--primary-color'], '--secondary-color': theme['--secondary-color'],
        '--accent-color': theme['--accent-color'], '--slider-color': theme['--slider-color'],
        '--bg-color': theme['--bg-color'], '--split-color': theme['--split-color']
    });
    if (shadowElement && theme['--primary-color-rgb']) {
        gsap.to(shadowElement, {
            duration: 0.5, ease: "power1.inOut",
            background: `radial-gradient(circle at center, rgba(${theme['--primary-color-rgb']}, 0.7), rgba(${theme['--primary-color-rgb']}, 0.5), rgba(${theme['--primary-color-rgb']}, 0))`
        });
    } else if (!shadowElement) {
        // console.warn("Shadow element not found during theme application.");
    }
}

// --- State Variables ---
let isMenuAnimating = false;
let currentHeroSlideIndex = 0;
let currentCardIndex = -1;
let lenis;
let overlaytimeline, imagestimeline;
let heroSliderInterval = null;
let isInitialized = false; // Flag to prevent double initialization

// --- Netflix-Style Carousel (Refactored for Multiple Instances) ---
function initializeCarousel(carouselElement) {
    const sliderContent = carouselElement?.querySelector('.slider-content');
    const prevButton = carouselElement?.querySelector('.prev');
    const nextButton = carouselElement?.querySelector('.next');
    const carouselId = carouselElement?.id || 'unknown_carousel';

    if (!carouselElement || !sliderContent || !prevButton || !nextButton) {
        console.warn(`Carousel elements missing for container '${carouselId}'. Skipping init.`);
        return;
    }

    const items = sliderContent.querySelectorAll('li');
    if (items.length === 0) {
        console.warn(`No items found in carousel list for container '${carouselId}'. Skipping init.`);
        return;
    }

    const getItemsPerSlide = () => (window.innerWidth <= 768) ? 1 : 2;

    items.forEach(item => {
        const infoBox = item.querySelector('.movie-info-hover');
        const titleEl = infoBox?.querySelector('.info-title');
        const descEl = infoBox?.querySelector('.info-description');
        const tagEl = infoBox?.querySelector('.info-tag');

        if (infoBox && titleEl) {
            titleEl.textContent = item.dataset.title || 'No Title';
            const description = item.dataset.description || '';
            if (descEl) {
                descEl.textContent = description;
                descEl.style.display = description ? 'block' : 'none';
            }
            const tagText = item.dataset.tag || '';
            if (tagEl) {
                tagEl.textContent = tagText;
                tagEl.style.display = tagText ? 'inline-block' : 'none';
            }
            item.setAttribute('tabindex', '0');
        } else {
            // console.warn(`Movie info box or title element missing for item in '${carouselId}':`, item);
        }
    });

    let isAnimating = false; // Prevent spam clicking

    const nextSlideCarousel = () => {
        if (isAnimating) return;
        isAnimating = true;
        sliderContent.classList.add('next-animation'); // Add class for potential styling
        const itemsToSlide = getItemsPerSlide();
        const percentageToSlide = 100; // Slide one full view

        gsap.to(sliderContent, {
            xPercent: -percentageToSlide,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
                const currentItems = Array.from(sliderContent.children);
                const numItemsToMove = Math.min(itemsToSlide, currentItems.length);
                if (numItemsToMove > 0) {
                    const itemsToMove = currentItems.slice(0, numItemsToMove);
                    itemsToMove.forEach(item => sliderContent.appendChild(item));
                }
                gsap.set(sliderContent, { xPercent: 0 }); // Reset position instantly
                sliderContent.classList.remove('next-animation');
                isAnimating = false;
            }
        });
    };

    const prevSlideCarousel = () => {
        if (isAnimating) return;
        isAnimating = true;
        sliderContent.classList.add('prev-animation');
        const itemsToSlide = getItemsPerSlide();
        const percentageToSlide = 100;
        const currentItems = Array.from(sliderContent.children);
        const numItemsToMove = Math.min(itemsToSlide, currentItems.length);

        if (numItemsToMove <= 0) {
             isAnimating = false;
             sliderContent.classList.remove('prev-animation');
             return;
        }

        const itemsToMove = currentItems.slice(-numItemsToMove);
        itemsToMove.reverse().forEach(item => sliderContent.insertBefore(item, sliderContent.firstChild));

        gsap.set(sliderContent, { xPercent: -percentageToSlide }); // Set starting position instantly

        gsap.to(sliderContent, {
            xPercent: 0,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
                sliderContent.classList.remove('prev-animation');
                isAnimating = false;
            }
        });
    };

    nextButton.addEventListener('click', nextSlideCarousel);
    prevButton.addEventListener('click', prevSlideCarousel);

    console.log(`Carousel initialized for container '${carouselId}'.`);
}

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded");

    const signupSection = document.getElementById('signup-section');
    const mainWebsiteContent = document.getElementById('main-website-content');
    const signupForm = document.getElementById('signup-form');
    const signupSubmitButton = document.getElementById('signup-submit-button');

    // --- Sign-up Form Validation ---
    const signupPassword = document.getElementById('signup_password');
    const signupConfirmPassword = document.getElementById('signup_confirm_password');
    const signupConfirmPassMsg = document.getElementById('signup-confirm-pass-msg');

    function validateSignupPasswordMatch() {
        if (!signupPassword || !signupConfirmPassword || !signupConfirmPassMsg) return true;
        const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--signup-error-color').trim() || '#e74c3c';
        if (signupPassword.value !== signupConfirmPassword.value && signupConfirmPassword.value.length > 0) {
            signupConfirmPassword.setCustomValidity("Passwords don't match");
            signupConfirmPassMsg.textContent = "Passwords don't match";
            signupConfirmPassMsg.style.color = errorColor;
            return false;
        } else {
            signupConfirmPassword.setCustomValidity('');
            signupConfirmPassMsg.textContent = "";
            signupConfirmPassMsg.style.color = '';
            return true;
        }
    }

    function checkSignupFormValidityAndUpdateButton() {
        if (!signupForm || !signupSubmitButton) return;
        const passwordsMatch = validateSignupPasswordMatch();
        const isFormValid = signupForm.checkValidity();
        signupSubmitButton.disabled = !(isFormValid && passwordsMatch);
    }

    if (signupPassword && signupConfirmPassword && signupForm) {
        [signupPassword, signupConfirmPassword, ...signupForm.querySelectorAll('input:not([type="password"])')]
            .forEach(input => {
                input.addEventListener('input', checkSignupFormValidityAndUpdateButton);
                input.addEventListener('blur', checkSignupFormValidityAndUpdateButton); // Also check on blur
            });
        checkSignupFormValidityAndUpdateButton(); // Initial check
    }

    // --- Function to Initialize Main Website ---
    function initializeMainWebsite() {
        if (isInitialized) {
            console.warn("Initialization already ran. Skipping.");
            return;
        }
        isInitialized = true;
        console.log("Initializing main website...");

        // --- Query Elements Needed Early ---
        const navElement = document.querySelector("nav");
        const mainElement = document.querySelector(".main");
        const heroImageContainer = document.querySelector(".hero-image-container");
        const overlayElement = document.querySelector(".overlay");
        const loaderElement = document.querySelector(".loader");
        const imageGridElement = document.querySelector(".image-grid");
        const gridImages = imageGridElement ? gsap.utils.toArray(imageGridElement.querySelectorAll(".img")) : [];
        const heroImageGridElement = imageGridElement?.querySelector(".img.hero-img");
        const nonHeroGridImages = gridImages.filter(img => img !== heroImageGridElement);
        const otherSections = gsap.utils.toArray(".steps, .outro, #trending, .carousel-outer-container, .contact-container, footer"); // Include steps

        // --- Essential Element Check ---
        if (!navElement || !mainElement || !heroImageContainer || !overlayElement || !loaderElement || !imageGridElement || !heroImageGridElement) {
             console.error("CRITICAL ERROR: One or more essential elements for initialization not found. Aborting initialization.");
             // Optionally display an error message to the user
             document.body.innerHTML = '<p style="color: red; padding: 20px;">Error loading page content. Please refresh.</p>';
             return;
        }

        // --- Lenis Smooth Scrolling ---
        try {
            lenis = new Lenis();
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
            console.log("Lenis initialized.");
        } catch (e) {
            console.error("Failed to initialize Lenis:", e);
            // Continue without Lenis if it fails
        }

        // --- Scroll to Top Button ---
        const scrollToTopBtn = document.getElementById("scrollToTopBtn");
        if (scrollToTopBtn) {
            const scrollFunction = () => {
                const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                scrollToTopBtn.classList.toggle("show", scrollPosition > 100);
            };
            window.addEventListener('scroll', scrollFunction);
            scrollToTopBtn.onclick = (e) => {
                e.preventDefault();
                if (lenis?.scrollTo) {
                    lenis.scrollTo(0, { duration: 1 });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            scrollFunction(); // Initial check
        }

        // --- Search Bar ---
        const searchContainer = document.querySelector('.search-container');
        const searchInput = document.querySelector('.search-input');
        if (searchContainer && searchInput) {
            searchContainer.addEventListener('click', (e) => {
                if (e.target !== searchInput) {
                    searchContainer.classList.add('focused');
                    searchInput.focus();
                }
            });
            searchInput.addEventListener('focus', () => searchContainer.classList.add('focused'));
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!searchInput.value && document.activeElement !== searchInput) {
                        searchContainer.classList.remove('focused');
                    }
                }, 150);
            });
        }

        // --- Text Splitting (Menu Header) ---
        const menuHeader = document.querySelector(".menu .header h1");
        if (menuHeader && menuHeader.innerText && !menuHeader.querySelector('span.char')) {
            menuHeader.innerHTML = menuHeader.innerText
                .split("")
                .map(char => `<span class="char">${char === " " ? " " : char}</span>`)
                .join("");
            console.log("Menu header text split.");
        }

        // --- Menu Toggle ---
        const menuToggle = document.querySelector(".menu-toggle");
        const menu = document.querySelector(".menu");
        if (menuToggle && menu) {
            const menuLinks = menu.querySelectorAll(".menu .link");
            const socialLinks = menu.querySelectorAll(".socials p");
            const filterMobile = menu.querySelector(".genre-filter-mobile");
            const menuVideoWrapper = menu.querySelector(".video-wrapper");
            const headerSpans = menu.querySelectorAll(".header h1 span.char");
            const elementsToFade = gsap.utils.toArray('#main-website-content > *:not(nav):not(.menu)');

            menuToggle.addEventListener("click", () => {
                if (isMenuAnimating) return;
                isMenuAnimating = true;
                const isOpen = menuToggle.classList.contains("closed");
                menuToggle.classList.toggle("closed", !isOpen);
                menuToggle.classList.toggle("opened", isOpen);
                const targetClipPath = isOpen ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
                const targetEase = isOpen ? "hop2" : "hop";

                gsap.to(menu, {
                    clipPath: targetClipPath, ease: targetEase, duration: 1.5,
                    onStart: () => isOpen && gsap.to(elementsToFade, { opacity: 0.2, duration: 0.5 }),
                    onComplete: () => {
                        menu.style.pointerEvents = isOpen ? "all" : "none";
                        if (!isOpen) {
                            gsap.to(elementsToFade, { opacity: 1, duration: 0.5, delay: 0.1 });
                            gsap.set([menuLinks, socialLinks], { y: 30, opacity: 0, clearProps: "all" });
                            gsap.set(menuVideoWrapper, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", clearProps: "all" });
                            gsap.set(filterMobile, { opacity: 0, y: 20, clearProps: "all" });
                            gsap.set(headerSpans, { y: 500, rotateY: 90, scale: 0.75, clearProps: "all" });
                        }
                        isMenuAnimating = false;
                    }
                });

                if (isOpen) {
                    gsap.to(menuLinks, { y: 0, opacity: 1, stagger: 0.2, delay: 0.85, duration: 1, ease: "power3.out" });
                    gsap.to(socialLinks, { y: 0, opacity: 1, stagger: 0.05, delay: 0.85, duration: 1, ease: "power3.out" });

                    if (filterMobile && window.getComputedStyle(filterMobile).display !== 'none') {
                        gsap.fromTo(filterMobile, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.9, ease: "power3.out" });
                        if (menuVideoWrapper) gsap.set(menuVideoWrapper, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });
                    } else {
                        if (menuVideoWrapper) gsap.to(menuVideoWrapper, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "hop2", duration: 1.5, delay: 0.5 });
                        if (filterMobile) gsap.set(filterMobile, { opacity: 0, y: 20 });
                    }

                    if (headerSpans.length > 0) {
                        gsap.to(headerSpans, { rotateY: 0, stagger: 0.05, delay: 0.75, duration: 1.5, ease: "power4.out" });
                        gsap.to(headerSpans, { y: 0, scale: 1, stagger: 0.05, delay: 0.5, duration: 1.5, ease: "power4.out" });
                    }
                }
            });
        } else {
            console.warn("Menu toggle or menu element not found.");
        }

        // --- Menu Navigation ---
        const menuNavLinks = document.querySelectorAll(".menu .link a");
        if (menuNavLinks.length > 0 && menuToggle && typeof lenis !== 'undefined') {
            menuNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    if (!targetId || targetId.length <= 1 || !targetId.startsWith('#')) return;
                    const targetElement = document.querySelector(targetId);
                    if (!targetElement) return;

                    const closeMenuAndScroll = () => {
                         setTimeout(() => {
                            lenis.scrollTo(targetElement, { offset: 0, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                         }, 200); // Delay scroll slightly
                    };

                    if (menuToggle.classList.contains('opened')) {
                         menuToggle.click(); // Close menu
                         closeMenuAndScroll();
                    } else {
                         lenis.scrollTo(targetElement, { offset: 0, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                    }
                });
            });
        }

        // --- Dynamic Overlay Content ---
        function initializeDynamicContent() {
             const projectsContainer = document.querySelector(".projects");
             const locationsContainer = document.querySelector(".locations");
             if (projectsContainer && projectsData) {
                 projectsContainer.innerHTML = '<div class="projects-header"><p>Movies</p><p>Directors</p></div>';
                 projectsData.forEach(p => projectsContainer.appendChild(Object.assign(document.createElement("div"), { className: "project-item", innerHTML: `<p>${p.name || 'N/A'}</p><p>${p.director || 'N/A'}</p>` })));
             }
             if (locationsContainer && projectsData) {
                 locationsContainer.innerHTML = '<div class="locations-header"><p>Locations</p></div>';
                 projectsData.forEach(p => locationsContainer.appendChild(Object.assign(document.createElement("div"), { className: "location-item", innerHTML: `<p>${p.location || 'N/A'}</p>` })));
             }
             console.log("Dynamic overlay content initialized.");
        }

        // --- Image Rotation ---
        const allImagesSources = Array.from({ length: 9 }, (_, i) => `./img${i + 1}.png`);
        const getRandomImages = () => [...allImagesSources].sort(() => 0.5 - Math.random()).slice(0, gridImages.length);
        function startImageRotation() {
            if (gridImages.length === 0) return;
            const totalCycles = 20;
            for (let cycle = 0; cycle < totalCycles; cycle++) {
                const randomImages = getRandomImages();
                gsap.delayedCall(cycle * 0.10, () => {
                    gridImages.forEach((wrapper, index) => {
                        const imgElement = wrapper.querySelector("img");
                        if (!imgElement) return;
                        if (cycle === totalCycles - 1 && wrapper === heroImageGridElement) {
                            imgElement.src = './img5.png'; // Ensure final hero image is correct
                        } else if (wrapper !== heroImageGridElement && randomImages.length > index) {
                            imgElement.src = randomImages[index];
                        }
                    });
                });
            }
            console.log("Image rotation started.");
        }

        // --- Initial States ---
        function setupMainWebsiteInitialStates() {
             gsap.set(navElement, { y: "-125%" });
             // Hide all major sections initially (opacity only, display is already block)
             gsap.set([mainElement, ...otherSections], { opacity: 0 });
             // But make sure the overlay and grid are ready (they handle their own intro)
             gsap.set(overlayElement, { opacity: 1, display: 'flex' }); // Overlay starts visible
             gsap.set(imageGridElement, { display: 'flex' }); // Image grid starts visible
             // Set initial state for hero container (width 0)
             gsap.set(heroImageContainer, { width: "0%" });
             applyTheme("Interstellar"); // Apply default theme
             console.log("Main website initial states set.");
        }

        // --- Hero Slider ---
        const slideOrder = [1, 2, 0]; // Indices in HeroSlider array
        let heroImageImgElement = null, movieNameElement = null, movieTagElement = null, groundImageImgElement = null, shadowElement = null;
        const sliderBars = document.querySelectorAll(".slider-bar > div");

        function updateSlider(slideIndexInOrder) {
            heroImageImgElement = heroImageContainer?.querySelector("img");
            movieNameElement = mainElement?.querySelector(".movie-name");
            movieTagElement = mainElement?.querySelector(".movie-tag");
            groundImageImgElement = mainElement?.querySelector(".ground img");
            shadowElement = mainElement?.querySelector(".shadow"); // Query shadow here

            if (!heroImageImgElement || !movieNameElement || !movieTagElement || !groundImageImgElement || !shadowElement) {
                console.error("Hero slider update failed: One or more elements missing.", { heroImageImgElement, movieNameElement, movieTagElement, groundImageImgElement, shadowElement });
                return;
            }

            const slideDataIndex = slideOrder[slideIndexInOrder];
            if (slideDataIndex === undefined || !HeroSlider || !HeroSlider[slideDataIndex]) {
                console.error(`Invalid hero slide index or data. Index: ${slideIndexInOrder}, DataIndex: ${slideDataIndex}`);
                return;
            }
            const slideData = HeroSlider[slideDataIndex];

            gsap.to([heroImageImgElement, movieNameElement, movieTagElement, groundImageImgElement, shadowElement], {
                opacity: 0, duration: 0.6, ease: "power1.inOut",
                onComplete: () => {
                    heroImageImgElement.src = slideData.imagesrc;
                    movieNameElement.textContent = slideData.movie_title;
                    movieTagElement.textContent = slideData.movie_theme;
                    groundImageImgElement.src = slideData.ground_img;
                    gsap.to([heroImageImgElement, movieNameElement, movieTagElement, groundImageImgElement, shadowElement], { opacity: 1, duration: 0.6, ease: "power1.inOut", delay: 0.1 });
                }
            });

            sliderBars.forEach(bar => bar.classList.remove('selected'));
            const barIndex = slideData.position - 1;
            if (barIndex >= 0 && barIndex < sliderBars.length) {
                sliderBars[barIndex].classList.add('selected');
            }
        }

        function nextSlide() {
            currentHeroSlideIndex = (currentHeroSlideIndex + 1) % slideOrder.length;
            updateSlider(currentHeroSlideIndex);
        }

        function startHeroSlider() {
            // Initial check
            heroImageImgElement = heroImageContainer?.querySelector("img");
            movieNameElement = mainElement?.querySelector(".movie-name");
            movieTagElement = mainElement?.querySelector(".movie-tag");
            groundImageImgElement = mainElement?.querySelector(".ground img");
            shadowElement = mainElement?.querySelector(".shadow");

            if (!heroImageImgElement || !movieNameElement || !movieTagElement || !groundImageImgElement || !shadowElement) {
                console.error("Cannot start hero slider - essential elements missing.");
                return;
            }

            updateSlider(currentHeroSlideIndex); // Show first slide immediately

            if (heroSliderInterval) heroSliderInterval.kill(); // Clear previous timer

            // Use GSAP delayedCall for robust looping
            heroSliderInterval = gsap.delayedCall(5, function repeat() {
                 nextSlide();
                 heroSliderInterval = gsap.delayedCall(5, repeat); // Reschedule
            });
            console.log("Hero slider started.");
        }

        // --- Intro Animation Timelines ---
        function createAnimationTimelines() {
            const logoLine1 = overlayElement.querySelector(".logo-line-1");
            const logoLine2 = overlayElement.querySelector(".logo-line-2");
            const projectHeaders = overlayElement.querySelectorAll(".projects-header, .project-item");
            const locationHeaders = overlayElement.querySelectorAll(".locations-header, .location-item");
            const mainHeroDetails = mainElement ? gsap.utils.toArray(mainElement.querySelectorAll(".movie-name, .movie-tag, .ground, .shadow, .slider-bar")) : [];

            // --- Check if all elements for timelines are present ---
             if (!logoLine1 || !logoLine2 || projectHeaders.length === 0 || locationHeaders.length === 0 || gridImages.length === 0 || mainHeroDetails.length === 0) {
                 console.error("Cannot create animation timelines - essential overlay, grid, or hero detail elements missing.");
                 // Fallback: Instantly show main content if timelines can't be built
                 gsap.set(overlayElement, { display: "none" });
                 gsap.set(imageGridElement, { display: "none" });
                 gsap.set(navElement, { y: 0 });
                 gsap.set([mainElement, ...otherSections], { opacity: 1 }); // Make content visible in fallback
                 if (heroImageContainer && heroImageGridElement) { // Manually move image if needed
                      const imgToMove = heroImageGridElement.querySelector('img');
                      if (imgToMove) {
                          heroImageContainer.innerHTML = '';
                          heroImageContainer.appendChild(imgToMove);
                          gsap.set(imgToMove, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', scale: 1, objectFit: "cover", clearProps: "transform, clipPath" });
                          gsap.set(heroImageGridElement, { display: 'none' });
                          gsap.set(heroImageContainer, { width: "90%", height: "80%" }); // Set final size
                      }
                 }
                 startHeroSlider(); // Attempt to start slider anyway
                 return; // Stop timeline creation
             }
             // --- End Element Check ---

            overlaytimeline = gsap.timeline({ paused: true });
            imagestimeline = gsap.timeline({ paused: true });

            // Define Overlay Timeline
            overlaytimeline
                .to(logoLine1, { backgroundPosition: "0% 0%", color: "var(--secondary-color)", duration: 1, ease: "none", delay: 0.5 })
                .to(logoLine2, { backgroundPosition: "0% 0%", color: "var(--secondary-color)", duration: 1, ease: "none" }, "<")
                .to(projectHeaders, { opacity: 1, duration: 0.15, stagger: 0.075 }, "+=0.3")
                .to(locationHeaders, { opacity: 1, duration: 0.15, stagger: 0.075 }, "<")
                .to(".project-item p", { color: "var(--secondary-color)", duration: 0.15, stagger: 0.035 })
                .to(".location-item p", { color: "var(--secondary-color)", duration: 0.15, stagger: 0.035 }, "<")
                .to(overlayElement, {
                    opacity: 0, duration: 1.5, delay: 1,
                    onComplete: () => {
                        gsap.set(overlayElement, { display: "none" });
                        console.log("Overlay animation complete. Starting image timeline.");
                        if (imagestimeline && !imagestimeline.isActive()) {
                             imagestimeline.play(); // Play next timeline
                        } else {
                             console.warn("Image timeline issue on overlay complete.");
                        }
                    }
                });

            // Define Image/Hero Timeline
            imagestimeline
                .to(gridImages, { // Reveal all grid images initially
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, stagger: 0.05, ease: "hop",
                    onStart: () => {
                        console.log("Image grid reveal started.");
                        startImageRotation(); // Start image flickering
                        gsap.to(loaderElement, { opacity: 0, display: "none", duration: 0.3 }); // Hide loader
                        gsap.to(navElement, { y: 0, duration: 0.8, ease: "power2.out" }); // Show Nav
                        gsap.to(mainElement, { opacity: 1, duration: 0.5 }); // Show Hero Section container
                    }
                })
                .to(nonHeroGridImages, { // Hide non-hero images
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", duration: 1, stagger: 0.05, ease: "hop", delay: 0.5
                 })
                .add(() => { // Move hero image logic
                    if (heroImageGridElement && heroImageContainer && heroImageGridElement.parentNode !== heroImageContainer) {
                         const imgToMove = heroImageGridElement.querySelector('img');
                         if (imgToMove) {
                             heroImageContainer.innerHTML = ''; // Clear placeholder
                             heroImageContainer.appendChild(imgToMove); // Move the actual <img>
                             gsap.set(imgToMove, { // Reset styles on the moved image
                                 position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                 scale: 1, objectFit: "cover", clearProps: "transform, clipPath"
                             });
                             console.log("Hero image moved to container.");
                             gsap.set(heroImageGridElement, { display: 'none' }); // Hide original grid slot
                         } else { console.error("Image element not found in hero grid element during move."); }
                    } else { console.log("Hero image move conditions not met."); }
                }, ">-0.8") // Timing relative to previous animation
                .to(heroImageContainer, { // Animate hero container size
                     width: "90%", height: "80%", duration: 1.5, ease: "hop"
                }, ">-0.5") // Start slightly after image move logic
                 .to(mainHeroDetails, { // Animate hero text/details in
                     opacity: 1, duration: 1, stagger: 0.1, ease: "hop2",
                     onStart: () => console.log("Revealing hero details..."), // Log start
                     onComplete: () => {
                         console.log("Hero reveal complete. Starting slider & fading in other sections.");
                         startHeroSlider(); // Start hero slider animations
                         // Fade in the rest of the page sections AFTER hero is fully visible
                         gsap.to(otherSections, { opacity: 1, duration: 1, ease: 'power1.inOut', stagger: 0.15, delay: 0.2 });
                     }
                 }, "<+=0.5"); // Stagger start relative to container animation

             console.log("Animation timelines created successfully.");
        }


        // --- Card Carousel (Steps Section) ---
        const stickySection = document.querySelector(".steps");
        const allCards = stickySection ? Array.from(stickySection.querySelectorAll(".steps .card")) : [];
        const countContainer = stickySection?.querySelector(".count-container");
        const clickableCards = allCards.filter(card => !card.classList.contains('empty'));
        const genreH1s = countContainer ? Array.from(countContainer.querySelectorAll('h1')) : [];

        if (stickySection && clickableCards.length > 0 && countContainer && genreH1s.length > 0) {
            const totalCards = clickableCards.length;
            const cardHeightFactor = window.innerHeight * 1.5;
            const additionalSpacingFactor = 1.5;
            const stickyHeight = cardHeightFactor * totalCards + (window.innerHeight * additionalSpacingFactor);
            console.log(`Steps section setup. Pin height: ${stickyHeight}px.`);

            let cardScrollTrigger = ScrollTrigger.create({
                trigger: stickySection, start: "top top", end: `+=${stickyHeight}px`,
                pin: true, pinSpacing: true, id: "cardCarouselPin",
                onUpdate: (self) => positionCards(self.progress),
                invalidateOnRefresh: true,
            });

            const getRadius = () => window.innerWidth < 900 ? window.innerWidth * 4.5 : window.innerWidth * 2.3;
            const arcAngle = Math.PI * 0.4;
            const startAngle = Math.PI / 2 - arcAngle / 2;

            function positionCards(progress = 0) {
                const radius = getRadius();
                const travelFactor = 7.5;
                const totalTravel = 1 + (totalCards / travelFactor);
                const adjustedProgress = (progress * totalTravel - 0.8) * 0.75;

                clickableCards.forEach((card, i) => {
                    const normalizedProgress = totalCards > 1 ? (totalCards - 1 - i) / (totalCards - 1) : 0;
                    const cardProgress = normalizedProgress + adjustedProgress;
                    const angle = startAngle + arcAngle * cardProgress;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const rotation = (angle - Math.PI / 2) * (180 / Math.PI);
                    let cardOpacity = 1;
                    const visibleAngleRange = Math.PI * 0.3;
                    const centerAngle = Math.PI / 2;
                    const angleDifference = Math.abs(angle - centerAngle);

                    if (angleDifference > visibleAngleRange / 2) {
                        cardOpacity = gsap.utils.mapRange(visibleAngleRange / 2, visibleAngleRange * 0.7, 1, 0, angleDifference);
                        cardOpacity = gsap.utils.clamp(0, 1, cardOpacity);
                    }
                    gsap.set(card, { x, y: -y + radius, rotation: -rotation, transformOrigin: "center center", opacity: cardOpacity, pointerEvents: cardOpacity > 0.5 ? 'auto' : 'none' });
                });
                allCards.forEach(card => { if (card.classList.contains('empty')) gsap.set(card, { opacity: 0, pointerEvents: 'none' }); });
            }
            positionCards(0); // Initial position

            // Intersection Observer for Genre Titles
            const observerOptions = { root: null, rootMargin: "0% 0% -50% 0%", threshold: 0.1 };
            const observerCallback = (entries) => {
                let topIntersectingCardIndex = -1;
                let maxIntersectionRatio = 0;
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight * 0.6) {
                        let cardIndex = clickableCards.indexOf(entry.target);
                        if (cardIndex !== -1 && parseFloat(window.getComputedStyle(entry.target).opacity) > 0.5) {
                            if (entry.intersectionRatio > maxIntersectionRatio) {
                                maxIntersectionRatio = entry.intersectionRatio;
                                topIntersectingCardIndex = cardIndex;
                            }
                        }
                    }
                });
                if (topIntersectingCardIndex !== -1 && topIntersectingCardIndex !== currentCardIndex) {
                    currentCardIndex = topIntersectingCardIndex;
                    if (currentCardIndex >= 0 && currentCardIndex < genreH1s.length) {
                        const h1Height = genreH1s[0].offsetHeight;
                        const targetY = -currentCardIndex * h1Height;
                        gsap.to(countContainer, { y: targetY, duration: 0.5, ease: "power2.out", overwrite: true });
                    }
                }
            };
            const cardObserver = new IntersectionObserver(observerCallback, observerOptions);
            clickableCards.forEach(card => cardObserver.observe(card));

            // Click Listener for Theme Change
            clickableCards.forEach(card => {
                card.addEventListener('pointerup', (e) => {
                    if (parseFloat(window.getComputedStyle(card).opacity) < 0.5) return;
                    const imgElement = card.querySelector('.bg-image');
                    if (imgElement?.alt) applyTheme(imgElement.alt);
                });
            });

            window.addEventListener("resize", () => {
                ScrollTrigger.refresh();
                const currentProgress = cardScrollTrigger?.progress || 0;
                positionCards(currentProgress);
                if (currentCardIndex >= 0 && currentCardIndex < genreH1s.length) {
                    const h1Height = genreH1s[0].offsetHeight;
                    gsap.set(countContainer, { y: -currentCardIndex * h1Height });
                }
            });

        } else {
            console.warn("Steps section setup skipped: Missing elements.");
            if (stickySection) stickySection.style.height = 'auto'; // Ensure it doesn't stay pinned
        }

        // --- Genre Filter (Mobile Menu) ---
        const genreFilterContainer = document.querySelector(".genre-filter-mobile .filter-buttons");
        function setupGenreFilter() {
            if (!genreFilterContainer || genreH1s.length === 0) {
                console.warn("Genre filter setup skipped: Missing elements.");
                const filterMobileDiv = document.querySelector(".genre-filter-mobile");
                if (filterMobileDiv) filterMobileDiv.style.display = 'none';
                return;
            }
            genreFilterContainer.innerHTML = ''; // Clear existing
            const allButton = document.createElement('button');
            allButton.className = 'genre-filter-button active';
            allButton.textContent = 'All';
            allButton.dataset.genre = 'All';
            genreFilterContainer.appendChild(allButton);
            const uniqueGenres = [...new Set(genreH1s.map(h1 => h1.textContent.trim()))];
            uniqueGenres.forEach(genre => {
                const button = document.createElement('button');
                button.className = 'genre-filter-button';
                button.textContent = genre;
                button.dataset.genre = genre;
                genreFilterContainer.appendChild(button);
            });
            genreFilterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('genre-filter-button') && !e.target.classList.contains('active')) {
                    const selectedGenre = e.target.dataset.genre;
                    genreFilterContainer.querySelectorAll('.genre-filter-button').forEach(btn => {
                        btn.classList.toggle('active', btn === e.target);
                    });
                    const themeNameToApply = genreToThemeMap[selectedGenre] || genreToThemeMap["All"];
                    applyTheme(themeNameToApply);
                }
            });
             console.log("Genre filter setup complete.");
        }

        // --- 3D Tunnel Gallery ---
        const entryOverlay = document.getElementById("entry-overlay");
        const galleryContainer = document.querySelector("#trending .container");
        const gallerySliderElement = document.querySelector("#trending .slider");
        const gallerySection = document.getElementById("trending");

        function initialize3dGallery() {
            if (!entryOverlay || !galleryContainer || !gallerySliderElement || !gallerySection || typeof slides === 'undefined' || !slides || slides.length === 0) {
                console.error("3D Gallery Init Failed: Missing required elements or slides data.");
                if (gallerySection) gallerySection.style.display = 'none';
                return;
            }

            const totalSlides = Math.min(slides.length, 10);
            const zStep = 2500;
            const initialZ = -(totalSlides * zStep);

            function generateSlides() {
                gallerySliderElement.innerHTML = "";
                for (let i = 0; i < totalSlides; i++) {
                    const slideData = slides[i];
                    if (!slideData?.id || !slideData?.title) continue;
                    const imageNumber = (i % 10) + 1;
                    const imageFilename = `./timg${imageNumber}.png`;
                    const slide = document.createElement("div");
                    slide.className = "slide";
                    slide.id = `gallery-slide-${i + 1}`;
                    slide.innerHTML = `
                        <div class="slide-img"><img src="${imageFilename}" alt="${slideData.title}" loading="lazy"></div>
                        <div class="slide-copy"><p>${slideData.title}</p><p>${slideData.id}</p></div>`;
                    gallerySliderElement.appendChild(slide);
                    const xPosition = i % 2 === 0 ? "45%" : "55%";
                    gsap.set(slide, { top: "50%", left: xPosition, xPercent: -50, yPercent: -50, z: initialZ + i * zStep, opacity: 0, willChange: 'transform, opacity' });
                }
                console.log(`${gallerySliderElement.children.length} gallery slides generated.`);
            }

            function mapRange(v, iM, iX, oM, oX) { return iM === iX ? oM : ((v - iM) * (oX - oM)) / (iX - iM) + oM; }

            function setupGalleryAnimation() {
                const allSlides = gsap.utils.toArray("#trending .slide");
                if (allSlides.length === 0) return;

                ScrollTrigger.getAll().forEach(st => { // Kill previous gallery triggers
                    if (st.vars.trigger === galleryContainer || st.vars.trigger === gallerySection || st.vars.pin === gallerySliderElement) st.kill();
                });

                 ScrollTrigger.create({
                    id: "galleryPin", trigger: gallerySection, start: "top top",
                    end: () => `+=${(totalSlides + 1) * window.innerHeight * 1.5}`,
                    pin: gallerySliderElement, pinSpacing: true, scrub: 1, invalidateOnRefresh: true,
                 });

                allSlides.forEach((slide, index) => {
                    const slideInitialZ = initialZ + index * zStep;
                    const copy = slide.querySelector('.slide-copy');
                    const requiredMovement = Math.abs(initialZ) + zStep * 1.5;

                    ScrollTrigger.create({
                        id: `gallerySlideAnim-${index}`, trigger: gallerySection, scrub: true,
                        start: "top top", end: () => `+=${(totalSlides + 1) * window.innerHeight * 1.5}`,
                        onUpdate: (self) => {
                            const currentZ = slideInitialZ + self.progress * requiredMovement;
                            const fadeEnd = 0, fadeOutStart = -zStep * 1.5, fadeInEnd = zStep * 1.2;
                            let opacity = 1;
                            if (currentZ > fadeEnd) opacity = mapRange(currentZ, fadeEnd, fadeInEnd, 1, 0);
                            else opacity = mapRange(currentZ, fadeOutStart, fadeEnd, 0, 1);
                            opacity = Math.max(0, Math.min(1, opacity));
                            gsap.set(slide, { z: currentZ, opacity: opacity });
                            if (copy) {
                                let copyOpacity = mapRange(opacity, 0.6, 1, 0, 1);
                                if (currentZ < -zStep * 0.2) copyOpacity = 0;
                                gsap.set(copy, { opacity: Math.max(0, Math.min(1, copyOpacity)) });
                            }
                        }
                    });
                });
                ScrollTrigger.refresh();
                console.log("Gallery ScrollTriggers initialized/refreshed.");

                if (lenis?.scrollTo && document.body.contains(gallerySection)) {
                    setTimeout(() => {
                        lenis.scrollTo(gallerySection, { offset: 5, duration: 1.2, onComplete: () => console.log("Scrolled to gallery.") });
                    }, 250);
                }
            }

            entryOverlay.addEventListener("click", () => {
                if (entryOverlay.classList.contains('opening') || entryOverlay.classList.contains('hiding')) return;
                entryOverlay.classList.add('opening');
                const splitLeft = document.getElementById('split-left');
                let transitionEnded = false;
                const onOverlayOpened = () => {
                    if (transitionEnded) return;
                    transitionEnded = true; clearTimeout(transitionTimeout);
                    entryOverlay.classList.add('hiding');
                    if (galleryContainer) {
                        galleryContainer.classList.add('active');
                        requestAnimationFrame(() => setTimeout(setupGalleryAnimation, 50));
                    } else { console.error("Gallery container missing!"); }
                };
                const transitionTimeout = setTimeout(onOverlayOpened, 1100);
                if (splitLeft) splitLeft.addEventListener('transitionend', onOverlayOpened, { once: true });
            }, { once: true });

            generateSlides();
            console.log("3D Gallery Initialized.");
        }

        // --- Initialize Components ---
        initializeDynamicContent();
        setupMainWebsiteInitialStates();
        createAnimationTimelines(); // Create timelines FIRST
        setupGenreFilter();
        initialize3dGallery();

        // Initialize ALL Carousels
        const allCarouselContainers = document.querySelectorAll('.carousel-container');
        if (allCarouselContainers.length > 0) {
            console.log(`Found ${allCarouselContainers.length} carousels.`);
            allCarouselContainers.forEach(initializeCarousel);
        } else {
            console.warn("No '.carousel-container' elements found.");
        }

        // --- START INTRO ANIMATION ---
        if (overlaytimeline) {
            console.log("Playing intro overlay timeline...");
            overlaytimeline.play();
        } else {
            console.error("Overlay timeline failed to create. Intro animation cannot start.");
            // Attempt immediate display as fallback (already handled within createAnimationTimelines fallback)
        }

        console.log("Main website initialization sequence complete.");

    } // --- End of initializeMainWebsite function ---


    // --- Sign Up Button Click Handler ---
    if (signupSubmitButton && signupSection && mainWebsiteContent) {
        signupSubmitButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupSubmitButton.disabled) {
                console.warn("Signup attempt while button is disabled.");
                gsap.fromTo(signupForm, { x: -8 }, { x: 8, clearProps: "x", duration: 0.08, repeat: 5 });
                return;
            }
            console.log("Signup valid, proceeding...");

            gsap.to(signupSection, {
                opacity: 0, duration: 0.6, ease: "power1.in",
                onComplete: () => {
                    gsap.set(signupSection, { display: 'none' });
                    // **** FIX: Set display, visibility, AND opacity for the main container ****
                    gsap.set(mainWebsiteContent, { display: 'block', visibility: 'visible', opacity: 1 });
                    console.log("Signup hidden, Main content container visible. Initializing internal animations...");
                    initializeMainWebsite(); // Initialize everything *after* display/visibility/opacity are set
                }
            });
        });
    } else {
        console.error("Signup components missing. Cannot set up signup handler.");
        // Fallback: If no signup, maybe show main content directly?
        // Check if it's already initialized to prevent issues on hot-reload etc.
        // if (mainWebsiteContent && !isInitialized) {
        //     console.log("No signup section found, initializing main website directly.");
        //     gsap.set(mainWebsiteContent, { display: 'block', visibility: 'visible', opacity: 1 }); // Ensure opacity is 1 here too
        //     initializeMainWebsite();
        // }
    }

}); // End DOMContentLoaded
