//Sare imports

import {
    projectsData
} from "./projects.js";
import {
    HeroSlider
} from "./hero_slider.js";
import {
    slides
} from './data.js';

//debounce for optimization

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

let isMenuAnimating = false;
let currentHeroSlideIndex = 0;
let currentCardIndex = -1;
let lenis;
let introOverlayTimeline, introImagesTimeline;
let heroSliderInterval = null;
let isInitialized = false;
let cardScrollTrigger = null;

// Caching kr deta hu optimization ke liye
const DOMCache = {
    signupSection: null,
    mainWebsiteContent: null,
    signupForm: null,
    signupSubmitButton: null,
    signupPassword: null,
    signupConfirmPassword: null,
    signupConfirmPassMsg: null,
    nav: null,
    main: null,
    heroImageContainer: null,
    heroImageImgElement: null,
    movieNameElement: null,
    movieTagElement: null,
    groundImageImgElement: null,
    shadowElement: null,
    sliderBars: null,
    overlay: null,
    loader: null,
    imageGrid: null,
    gridImages: null,
    heroImageGridElement: null,
    nonHeroGridImages: null,
    otherSections: null,
    menuToggle: null,
    menu: null,
    menuLinks: null,
    socialLinks: null,
    filterMobileContainer: null,
    filterMobileElement: null,
    menuVideoWrapper: null,
    menuHeaderSpans: null,
    menuNavLinks: null,
    searchContainer: null,
    searchInput: null,
    scrollToTopBtn: null,
    stepsSection: null,
    allCards: null,
    clickableCards: null,
    countContainer: null,
    genreH1s: null,
    entryOverlay: null,
    galleryContainer: null,
    gallerySliderElement: null,
    gallerySection: null,
    allCarouselContainers: null,
    projectsContainer: null,
    locationsContainer: null,
    contactForm: null,
};

// Sare theme ke colours ko declare
const cardThemes = {
    "Spiderman No Way Home": {
        "--primary-color": "#330000",
        "--secondary-color": "#ffffff",
        "--accent-color": "#ff4d4d",
        "--slider-color": "#cc0000",
        "--bg-color": "#1a0000",
        "--primary-color-rgb": "51, 0, 0",
        "--split-color": "#1e0202"
    },
    "Interstellar": {
        "--primary-color": "#000000",
        "--secondary-color": "#ffffff",
        "--accent-color": "#cccccc",
        "--slider-color": "#ff4c00",
        "--bg-color": "#2a2a2a",
        "--primary-color-rgb": "0, 0, 0",
        "--split-color": "#080808"
    },
    "Aladdin": {
        "--primary-color": "#1a0033",
        "--secondary-color": "#ffffcc",
        "--accent-color": "#99ccff",
        "--slider-color": "#ffcc00",
        "--bg-color": "#330066",
        "--primary-color-rgb": "26, 0, 51",
        "--split-color": "#100020"
    },
    "Transformers One": {
        "--primary-color": "#1a1a1a",
        "--secondary-color": "#ffff00",
        "--accent-color": "#cccccc",
        "--slider-color": "#ff8000",
        "--bg-color": "#333333",
        "--primary-color-rgb": "26, 26, 26",
        "--split-color": "#0f0f0f"
    },
    "Iron Man": {
        "--primary-color": "#4d0000",
        "--secondary-color": "#ffff00",
        "--accent-color": "#ff4d4d",
        "--slider-color": "#ffcc00",
        "--bg-color": "#2a0000",
        "--primary-color-rgb": "77, 0, 0",
        "--split-color": "#2e0000"
    }
};
const genreToThemeMap = {
    "Action": "Spiderman No Way Home",
    "Sci-fi": "Interstellar",
    "Fantasy": "Aladdin",
    "Animation": "Transformers One",
    "Thriller": "Iron Man",
    "All": "Interstellar"
};

// Theme apply krne ka code

function applyTheme(themeName) {
    const theme = cardThemes[themeName];
    const root = document.documentElement;
    const shadowElement = DOMCache.shadowElement;

    if (!theme) {
        console.warn(`Theme not found for: ${themeName}. Using default 'Interstellar' theme.`);
        applyTheme("Interstellar");
        return;
    }
    gsap.to(root, {
        duration: 0.5,
        ease: "power1.inOut",
        '--primary-color': theme['--primary-color'],
        '--secondary-color': theme['--secondary-color'],
        '--accent-color': theme['--accent-color'],
        '--slider-color': theme['--slider-color'],
        '--bg-color': theme['--bg-color'],
        '--split-color': theme['--split-color'],
        overwrite: 'auto'
    });
    if (shadowElement && theme['--primary-color-rgb']) {
        gsap.to(shadowElement, {
            duration: 0.5,
            ease: "power1.inOut",
            background: `radial-gradient(circle at center, rgba(${theme['--primary-color-rgb']}, 0.7), rgba(${theme['--primary-color-rgb']}, 0.5), rgba(${theme['--primary-color-rgb']}, 0))`,
            overwrite: 'auto'
        });
    }
}

function queryDOMElements() {
    // Every element that needs
    DOMCache.signupSection = document.getElementById('signup-section');
    DOMCache.mainWebsiteContent = document.getElementById('main-website-content');
    DOMCache.signupForm = document.getElementById('signup-form');
    DOMCache.signupSubmitButton = document.getElementById('signup-submit-button');
    DOMCache.signupPassword = document.getElementById('signup_password');
    DOMCache.signupConfirmPassword = document.getElementById('signup_confirm_password');
    DOMCache.signupConfirmPassMsg = document.getElementById('signup-confirm-pass-msg');
    DOMCache.nav = document.querySelector("nav");
    DOMCache.main = document.querySelector(".main");
    DOMCache.heroImageContainer = document.querySelector(".hero-image-container");
    DOMCache.movieNameElement = DOMCache.main?.querySelector(".movie-name");
    DOMCache.movieTagElement = DOMCache.main?.querySelector(".movie-tag");
    DOMCache.groundImageImgElement = DOMCache.main?.querySelector(".ground img");
    DOMCache.shadowElement = DOMCache.main?.querySelector(".shadow");
    DOMCache.sliderBars = DOMCache.main ? gsap.utils.toArray(DOMCache.main.querySelectorAll(".slider-bar > div")) : [];
    DOMCache.overlay = document.querySelector(".overlay");
    DOMCache.loader = DOMCache.overlay?.querySelector(".loader");
    DOMCache.imageGrid = document.querySelector(".image-grid");
    DOMCache.gridImages = DOMCache.imageGrid ? gsap.utils.toArray(DOMCache.imageGrid.querySelectorAll(".img")) : [];
    DOMCache.heroImageGridElement = DOMCache.imageGrid?.querySelector(".img.hero-img");
    DOMCache.nonHeroGridImages = DOMCache.gridImages.filter(img => img !== DOMCache.heroImageGridElement);
    DOMCache.otherSections = gsap.utils.toArray("#main-website-content > *:not(#signup-section):not(.overlay):not(.image-grid):not(nav):not(.main):not(.menu)");
    DOMCache.menuToggle = document.querySelector(".menu-toggle");
    DOMCache.menu = document.querySelector(".menu");
    DOMCache.menuLinks = DOMCache.menu ? DOMCache.menu.querySelectorAll(".menu .link") : [];
    DOMCache.socialLinks = DOMCache.menu ? DOMCache.menu.querySelectorAll(".socials p") : [];
    DOMCache.filterMobileElement = DOMCache.menu?.querySelector(".genre-filter-mobile");
    DOMCache.filterMobileContainer = DOMCache.filterMobileElement?.querySelector(".filter-buttons");
    DOMCache.menuVideoWrapper = DOMCache.menu?.querySelector(".video-wrapper");
    const menuHeader = DOMCache.menu?.querySelector(".menu .header h1");
    if (menuHeader && menuHeader.innerText && !menuHeader.querySelector('span.char')) {
        menuHeader.innerHTML = menuHeader.innerText
            .split("")
            .map(char => `<span class="char">${char === " " ? "\u00A0" : char}</span>`)
            .join("");
    }
    DOMCache.menuHeaderSpans = menuHeader ? menuHeader.querySelectorAll("span.char") : [];
    DOMCache.menuNavLinks = DOMCache.menu ? DOMCache.menu.querySelectorAll(".menu .link a") : [];
    DOMCache.searchContainer = document.querySelector('.search-container');
    DOMCache.searchInput = document.querySelector('.search-input');
    DOMCache.scrollToTopBtn = document.getElementById("scrollToTopBtn");
    DOMCache.stepsSection = document.querySelector(".steps");
    DOMCache.allCards = DOMCache.stepsSection ? Array.from(DOMCache.stepsSection.querySelectorAll(".steps .card")) : [];
    DOMCache.countContainer = DOMCache.stepsSection?.querySelector(".count-container");
    DOMCache.clickableCards = DOMCache.allCards.filter(card => !card.classList.contains('empty'));
    DOMCache.genreH1s = DOMCache.countContainer ? Array.from(DOMCache.countContainer.querySelectorAll('h1')) : [];
    DOMCache.entryOverlay = document.getElementById("entry-overlay");
    DOMCache.galleryContainer = document.querySelector("#trending .container");
    DOMCache.gallerySliderElement = document.querySelector("#trending .slider");
    DOMCache.gallerySection = document.getElementById("trending");
    DOMCache.allCarouselContainers = document.querySelectorAll('.carousel-container');
    DOMCache.projectsContainer = DOMCache.overlay?.querySelector(".projects");
    DOMCache.locationsContainer = DOMCache.overlay?.querySelector(".locations");
    DOMCache.contactForm = document.querySelector('.contact-form form');
}

//Lenis krdo setup for smooth scrolling
function initLenis() {
    if (typeof Lenis === 'undefined') {
        console.error("Lenis library not found.");
        return;
    }
    try {
        lenis = new Lenis();
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        console.log("Lenis initialized.");
    } catch (e) {
        console.error("Failed to initialize Lenis:", e);
    }
}

function initScrollToTop() {
    if (!DOMCache.scrollToTopBtn) return;
    const scrollFunction = () => {
        if (!DOMCache.scrollToTopBtn) return;
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        DOMCache.scrollToTopBtn.classList.toggle("show", scrollPosition > 100);
    };
    window.addEventListener('scroll', scrollFunction, {
        passive: true
    });
    DOMCache.scrollToTopBtn.onclick = (e) => {
        e.preventDefault();
        if (lenis?.scrollTo) {
            lenis.scrollTo(0, {
                duration: 1
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    scrollFunction();
}

// Search animation
function initSearch() {
    if (!DOMCache.searchContainer || !DOMCache.searchInput) return;
    DOMCache.searchContainer.addEventListener('click', (e) => {
        if (e.target !== DOMCache.searchInput) {
            DOMCache.searchContainer.classList.add('focused');
            DOMCache.searchInput.focus();
        }
    });
    DOMCache.searchInput.addEventListener('focus', () => DOMCache.searchContainer.classList.add('focused'));
    DOMCache.searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (!DOMCache.searchInput.value && document.activeElement !== DOMCache.searchInput) {
                DOMCache.searchContainer.classList.remove('focused');
            }
        }, 150);
    });
}

//Menu Animation and sara logic vgera

function initMenu() {

    if (!DOMCache.menuToggle || !DOMCache.menu) {
        console.warn("Menu toggle or menu element not found.");
        return;
    }

    const elementsToFade = DOMCache.otherSections;

    DOMCache.menuToggle.addEventListener("click", () => {
        if (isMenuAnimating) return;
        isMenuAnimating = true;
        const isOpen = DOMCache.menuToggle.classList.contains("closed");

        DOMCache.menuToggle.classList.toggle("closed", !isOpen);
        DOMCache.menuToggle.classList.toggle("opened", isOpen);
        DOMCache.menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        const targetClipPath = isOpen ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        const targetEase = isOpen ? "hop2" : "hop";

        const menuLinksTarget = {
            y: isOpen ? 0 : 30,
            opacity: isOpen ? 1 : 0
        };
        const socialLinksTarget = {
            y: isOpen ? 0 : 30,
            opacity: isOpen ? 1 : 0
        };
        const filterMobileTarget = {
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : 20
        };
        const menuVideoTarget = {
            clipPath: isOpen ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
        };
        const headerSpansTarget = {
            rotateY: isOpen ? 0 : 90,
            y: isOpen ? 0 : 500,
            scale: isOpen ? 1 : 0.75
        };
        const elementsFadeTarget = {
            opacity: isOpen ? 0.2 : 1
        };

        gsap.to(DOMCache.menu, {
            clipPath: targetClipPath,
            ease: targetEase,
            duration: 1.5,
            onStart: () => {
                if (isOpen) gsap.to(elementsToFade, {
                    opacity: elementsFadeTarget.opacity,
                    duration: 0.5
                });
            },
            onComplete: () => {
                DOMCache.menu.style.pointerEvents = isOpen ? "all" : "none";
                if (!isOpen) {
                    gsap.to(elementsToFade, {
                        opacity: elementsFadeTarget.opacity,
                        duration: 0.5,
                        delay: 0.1
                    });

                    gsap.set(DOMCache.menuLinks, {
                        y: 30,
                        opacity: 0
                    });
                    gsap.set(DOMCache.socialLinks, {
                        y: 30,
                        opacity: 0
                    });
                    gsap.set(DOMCache.menuVideoWrapper, {
                        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                    });
                    gsap.set(DOMCache.filterMobileElement, {
                        opacity: 0,
                        y: 20
                    });
                    gsap.set(DOMCache.menuHeaderSpans, {
                        y: 500,
                        rotateY: 90,
                        scale: 0.75
                    });

                }
                isMenuAnimating = false;
            }
        });

        if (isOpen) {

            gsap.to(DOMCache.menuLinks, {
                y: 0,
                opacity: 1,
                stagger: 0.2,
                delay: 0.85,
                duration: 1,
                ease: "power3.out"
            });
            gsap.to(DOMCache.socialLinks, {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                delay: 0.85,
                duration: 1,
                ease: "power3.out"
            });

            if (DOMCache.filterMobileElement && window.getComputedStyle(DOMCache.filterMobileElement).display !== 'none') {
                gsap.fromTo(DOMCache.filterMobileElement, {
                    opacity: 0,
                    y: 20
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: 0.9,
                    ease: "power3.out"
                });
                if (DOMCache.menuVideoWrapper) gsap.set(DOMCache.menuVideoWrapper, {
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                });
            } else {
                if (DOMCache.menuVideoWrapper) gsap.to(DOMCache.menuVideoWrapper, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "hop2",
                    duration: 1.5,
                    delay: 0.5
                });
                if (DOMCache.filterMobileElement) gsap.set(DOMCache.filterMobileElement, {
                    opacity: 0,
                    y: 20
                });
            }

            if (DOMCache.menuHeaderSpans.length > 0) {
                gsap.to(DOMCache.menuHeaderSpans, {
                    rotateY: 0,
                    stagger: 0.05,
                    delay: 0.75,
                    duration: 1.5,
                    ease: "power4.out"
                });
                gsap.to(DOMCache.menuHeaderSpans, {
                    y: 0,
                    scale: 1,
                    stagger: 0.05,
                    delay: 0.5,
                    duration: 1.5,
                    ease: "power4.out"
                });
            }
        }
    });

    if (DOMCache.menuNavLinks.length > 0 && typeof lenis !== 'undefined') {
        DOMCache.menuNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (!targetId || targetId.length <= 1 || !targetId.startsWith('#')) return;
                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;
                const closeMenuAndScroll = () => {
                    setTimeout(() => {
                        if (lenis) {
                            lenis.scrollTo(targetElement, {
                                offset: 0,
                                duration: 1.5
                            });
                        } else {
                            targetElement.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }
                    }, 200);
                };
                if (DOMCache.menuToggle.classList.contains('opened')) {
                    DOMCache.menuToggle.click();
                    closeMenuAndScroll();
                } else {
                    if (lenis) {
                        lenis.scrollTo(targetElement, {
                            offset: 0,
                            duration: 1.5
                        });
                    } else {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// Loading ka chota sa animation 
function initDynamicOverlayContent() {
    if (!DOMCache.projectsContainer || !DOMCache.locationsContainer) return;
    if (typeof projectsData === 'undefined') {
        console.warn("projectsData not found for dynamic overlay.");
        return;
    }
    DOMCache.projectsContainer.innerHTML = '<div class="projects-header"><p>Movies</p><p>Directors</p></div>';
    DOMCache.locationsContainer.innerHTML = '<div class="locations-header"><p>Locations</p></div>';
    const projectsFragment = document.createDocumentFragment();
    const locationsFragment = document.createDocumentFragment();
    projectsData.forEach(p => {
        const projectDiv = document.createElement("div");
        projectDiv.className = "project-item";
        projectDiv.innerHTML = `<p>${p.name || 'N/A'}</p><p>${p.director || 'N/A'}</p>`;
        projectsFragment.appendChild(projectDiv);
        const locationDiv = document.createElement("div");
        locationDiv.className = "location-item";
        locationDiv.innerHTML = `<p>${p.location || 'N/A'}</p>`;
        locationsFragment.appendChild(locationDiv);
    });
    DOMCache.projectsContainer.appendChild(projectsFragment);
    DOMCache.locationsContainer.appendChild(locationsFragment);
    console.log("Dynamic overlay content initialized.");
}

//main center wala remix joh hota h woh animation
function initIntroAnimation() {

    if (!DOMCache.overlay || !DOMCache.loader || !DOMCache.imageGrid || !DOMCache.main) {
        console.error("Cannot create intro animation timelines - essential elements missing.");
        gsap.set(DOMCache.overlay, {
            display: "none"
        });
        gsap.set(DOMCache.imageGrid, {
            display: "none"
        });
        gsap.set(DOMCache.nav, {
            y: 0
        });
        gsap.set([DOMCache.main, ...DOMCache.otherSections], {
            opacity: 1
        });
        if (DOMCache.heroImageContainer && DOMCache.heroImageGridElement) {
            const imgToMove = DOMCache.heroImageGridElement.querySelector('img');
            if (imgToMove) {
                DOMCache.heroImageContainer.innerHTML = '';
                DOMCache.heroImageContainer.appendChild(imgToMove.cloneNode(true));
                gsap.set(DOMCache.heroImageContainer.firstChild, {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    scale: 1,
                    objectFit: "cover",
                    clearProps: "transform, clipPath"
                });
                gsap.set(DOMCache.heroImageGridElement, {
                    display: 'none'
                });
                gsap.set(DOMCache.heroImageContainer, {
                    width: "90%",
                    height: "80%",
                    opacity: 1
                });
            }
        }
        initHeroSlider();
        return;
    }

    const logoLine1 = DOMCache.loader.querySelector(".logo-line-1");
    const logoLine2 = DOMCache.loader.querySelector(".logo-line-2");
    const projectItems = DOMCache.overlay.querySelectorAll(".projects-header, .project-item");
    const locationItems = DOMCache.overlay.querySelectorAll(".locations-header, .location-item");
    const projectItemTexts = DOMCache.overlay.querySelectorAll(".project-item p");
    const locationItemTexts = DOMCache.overlay.querySelectorAll(".location-item p");
    const mainHeroDetails = DOMCache.main ? gsap.utils.toArray(DOMCache.main.querySelectorAll(".movie-name, .movie-tag, .ground, .shadow, .slider-bar")) : [];

    if (!logoLine1 || !logoLine2 || DOMCache.gridImages.length === 0 || mainHeroDetails.length === 0) {
        console.error("Cannot create intro animation timelines - specific sub-elements missing.");

        gsap.set(DOMCache.overlay, {
            display: "none"
        });
        gsap.set(DOMCache.imageGrid, {
            display: "none"
        });
        gsap.set(DOMCache.nav, {
            y: 0
        });
        gsap.set([DOMCache.main, ...DOMCache.otherSections], {
            opacity: 1
        });
        if (DOMCache.heroImageContainer && DOMCache.heroImageGridElement) {
            const imgToMove = DOMCache.heroImageGridElement.querySelector('img');
            if (imgToMove) {
                DOMCache.heroImageContainer.innerHTML = '';
                DOMCache.heroImageContainer.appendChild(imgToMove.cloneNode(true));
                gsap.set(DOMCache.heroImageContainer.firstChild, {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    scale: 1,
                    objectFit: "cover",
                    clearProps: "transform, clipPath"
                });
                gsap.set(DOMCache.heroImageGridElement, {
                    display: 'none'
                });
                gsap.set(DOMCache.heroImageContainer, {
                    width: "90%",
                    height: "80%",
                    opacity: 1
                });
            }
        }
        initHeroSlider();
        return;
    }

    gsap.set(DOMCache.nav, {
        y: "-125%"
    });
    gsap.set([DOMCache.main, ...DOMCache.otherSections], {
        opacity: 0
    });
    gsap.set(DOMCache.overlay, {
        opacity: 1,
        display: 'flex'
    });
    gsap.set(DOMCache.imageGrid, {
        display: 'flex'
    });
    gsap.set(DOMCache.heroImageContainer, {
        width: "0%",
        height: "0%",
        opacity: 0
    });
    gsap.set([...projectItems, ...locationItems], {
        opacity: 0
    });
    gsap.set([...projectItemTexts, ...locationItemTexts], {
        color: "#4f4f4f"
    });
    applyTheme("Interstellar");

    introOverlayTimeline = gsap.timeline({
        paused: true
    });
    introImagesTimeline = gsap.timeline({
        paused: true
    });

    introOverlayTimeline
        .to(logoLine1, {
            backgroundPosition: "0% 0%",
            color: "var(--secondary-color)",
            duration: 1,
            ease: "none",
            delay: 0.5
        })
        .to(logoLine2, {
            backgroundPosition: "0% 0%",
            color: "var(--secondary-color)",
            duration: 1,
            ease: "none"
        }, "<")
        .to(projectItems, {
            opacity: 1,
            duration: 0.15,
            stagger: 0.075
        }, "+=0.3")
        .to(locationItems, {
            opacity: 1,
            duration: 0.15,
            stagger: 0.075
        }, "<")
        .to(projectItemTexts, {
            color: "var(--secondary-color)",
            duration: 0.15,
            stagger: 0.035
        })
        .to(locationItemTexts, {
            color: "var(--secondary-color)",
            duration: 0.15,
            stagger: 0.035
        }, "<")
        .to(DOMCache.overlay, {
            opacity: 0,
            duration: 1.5,
            delay: 1,
            onComplete: () => {
                gsap.set(DOMCache.overlay, {
                    display: "none"
                });
                console.log("Overlay animation complete.");

                if (introImagesTimeline && !introImagesTimeline.isActive()) {
                    introImagesTimeline.play();
                } else {
                    console.warn("Image timeline issue on overlay complete.");
                }
            }
        });

    introImagesTimeline
        .to(DOMCache.gridImages, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1,
            stagger: 0.05,
            ease: "hop",
            onStart: () => {
                console.log("Image grid reveal started.");
                startImageRotation();
                gsap.to(DOMCache.loader, {
                    opacity: 0,
                    display: "none",
                    duration: 0.3
                });
                gsap.to(DOMCache.nav, {
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to(DOMCache.main, {
                    opacity: 1,
                    duration: 0.5
                });
            }
        })
        .to(DOMCache.nonHeroGridImages, {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
            duration: 1,
            stagger: 0.05,
            ease: "hop",
            delay: 0.5
        })
        .add(() => {
            if (DOMCache.heroImageGridElement && DOMCache.heroImageContainer) {
                const imgToMove = DOMCache.heroImageGridElement.querySelector('img');
                if (imgToMove) {
                    DOMCache.heroImageContainer.innerHTML = '';
                    DOMCache.heroImageContainer.appendChild(imgToMove);
                    gsap.set(imgToMove, {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        scale: 1,
                        objectFit: "cover",
                        clearProps: "transform, clipPath"
                    });
                    console.log("Hero image moved to container.");
                    gsap.set(DOMCache.heroImageGridElement, {
                        display: 'none'
                    });
                } else {
                    console.error("Image element not found in hero grid element during move.");
                }
            } else {
                console.log("Hero image move conditions not met.");
            }
        }, ">-0.8")
        .to(DOMCache.heroImageContainer, {
            width: "90%",
            height: "80%",
            opacity: 1,
            duration: 1.5,
            ease: "hop"
        }, ">-0.5")
        .to(mainHeroDetails, {
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "hop2",
            onStart: () => console.log("Revealing hero details..."),
            onComplete: () => {
                console.log("Intro sequence complete. Starting slider & revealing sections.");
                initHeroSlider();
                gsap.to(DOMCache.otherSections, {
                    opacity: 1,
                    duration: 1,
                    ease: 'power1.inOut',
                    stagger: 0.15,
                    delay: 0.2
                });
            }
        }, "<+=0.5");

    console.log("Intro animation timelines created successfully (Original Logic).");

    requestAnimationFrame(() => {
        if (introOverlayTimeline) {
            introOverlayTimeline.play();
        }
    });
}

function startImageRotation() {
    if (!DOMCache.gridImages || DOMCache.gridImages.length === 0) return;
    const allImagesSources = Array.from({
        length: 9
    }, (_, i) => `./img${i + 1}.png`);
    const getRandomImages = () => [...allImagesSources].sort(() => 0.5 - Math.random()).slice(0, DOMCache.gridImages.length);
    const totalCycles = 15;
    for (let cycle = 0; cycle < totalCycles; cycle++) {
        gsap.delayedCall(cycle * 0.08, () => {
            const randomImages = getRandomImages();
            DOMCache.gridImages.forEach((wrapper, index) => {
                const imgElement = wrapper.querySelector("img");
                if (!imgElement) return;
                if (cycle === totalCycles - 1 && wrapper === DOMCache.heroImageGridElement) {
                    imgElement.src = './img5.png';
                } else if (wrapper !== DOMCache.heroImageGridElement && randomImages.length > index) {
                    imgElement.src = randomImages[index];
                }
            });
        });
    }
    console.log("Image rotation effect started.");
}


//Hero slider logic likh denge
function updateHeroSlider(slideIndexInOrder) {
    DOMCache.heroImageImgElement = DOMCache.heroImageContainer?.querySelector("img");
    if (!DOMCache.heroImageImgElement || !DOMCache.movieNameElement || !DOMCache.movieTagElement || !DOMCache.groundImageImgElement || !DOMCache.shadowElement || !DOMCache.sliderBars) {
        console.error("Hero slider update failed: Missing elements.");
        return;
    }
    if (typeof HeroSlider === 'undefined') {
        console.error("HeroSlider data not available.");
        return;
    }
    const slideOrder = [1, 2, 0];
    const slideDataIndex = slideOrder[slideIndexInOrder];
    if (slideDataIndex === undefined || !HeroSlider || !HeroSlider[slideDataIndex]) {
        console.error(`Invalid hero slide index/data: ${slideIndexInOrder}, ${slideDataIndex}`);
        return;
    }
    const slideData = HeroSlider[slideDataIndex];
    gsap.to([DOMCache.heroImageImgElement, DOMCache.movieNameElement, DOMCache.movieTagElement, DOMCache.groundImageImgElement, DOMCache.shadowElement], {
        opacity: 0,
        duration: 0.6,
        ease: "power1.inOut",
        onComplete: () => {
            DOMCache.heroImageImgElement.src = slideData.imagesrc;
            DOMCache.movieNameElement.textContent = slideData.movie_title;
            DOMCache.movieTagElement.textContent = slideData.movie_theme;
            DOMCache.groundImageImgElement.src = slideData.ground_img;
            gsap.to([DOMCache.heroImageImgElement, DOMCache.movieNameElement, DOMCache.movieTagElement, DOMCache.groundImageImgElement, DOMCache.shadowElement], {
                opacity: 1,
                duration: 0.6,
                ease: "power1.inOut",
                delay: 0.1
            });
        }
    });
    DOMCache.sliderBars.forEach(bar => bar.classList.remove('selected'));
    const barIndex = slideData.position - 1;
    if (barIndex >= 0 && barIndex < DOMCache.sliderBars.length) {
        DOMCache.sliderBars[barIndex].classList.add('selected');
    }
}

function nextHeroSlide() {
    currentHeroSlideIndex = (currentHeroSlideIndex + 1) % 3;
    updateHeroSlider(currentHeroSlideIndex);
}

function initHeroSlider() {

    DOMCache.heroImageImgElement = DOMCache.heroImageContainer?.querySelector("img");
    if (!DOMCache.heroImageImgElement || !DOMCache.movieNameElement || !DOMCache.movieTagElement || !DOMCache.groundImageImgElement || !DOMCache.shadowElement) {
        console.error("Cannot start hero slider - essential elements missing or not ready after intro.");
        gsap.set([DOMCache.movieNameElement, DOMCache.movieTagElement, DOMCache.groundImageImgElement, DOMCache.shadowElement, DOMCache.sliderBars], {
            opacity: 1
        });
        return;
    }
    if (heroSliderInterval) heroSliderInterval.kill();
    updateHeroSlider(currentHeroSlideIndex);
    heroSliderInterval = gsap.delayedCall(5, function repeat() {
        nextHeroSlide();
        heroSliderInterval = gsap.delayedCall(5, repeat);
    });
    console.log("Hero slider started.");
}

// Genre section ka animation m joh slider ka code

function initStickyCards() {

    if (!DOMCache.stepsSection || DOMCache.clickableCards.length === 0 || !DOMCache.countContainer || DOMCache.genreH1s.length === 0) {
        console.warn("Steps section setup skipped: Missing elements.");
        if (DOMCache.stepsSection) DOMCache.stepsSection.style.height = 'auto';
        return;
    }

    const totalCards = DOMCache.clickableCards.length;

    const cardHeightFactor = window.innerHeight * 1.5;
    const additionalSpacingFactor = 1.5;
    const stickyHeight = () => cardHeightFactor * totalCards + (window.innerHeight * additionalSpacingFactor);

    console.log(`Steps section setup. Pin height calculation: ~${stickyHeight()}px.`);

    if (cardScrollTrigger) {
        cardScrollTrigger.kill();
        cardScrollTrigger = null;
    }

    cardScrollTrigger = ScrollTrigger.create({
        trigger: DOMCache.stepsSection,
        start: "top top",
        end: () => `+=${stickyHeight()}px`,
        pin: true,
        pinSpacing: true,
        id: "cardCarouselPin",
        onUpdate: (self) => positionCards(self.progress),
        invalidateOnRefresh: true,
    });
    console.log("Created card ScrollTrigger.");

    const getRadius = () => window.innerWidth < 900 ? window.innerWidth * 4.5 : window.innerWidth * 2.3;
    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;

    function positionCards(progress = 0) {
        if (!DOMCache.clickableCards || DOMCache.clickableCards.length === 0) return;
        const radius = getRadius();
        const travelFactor = 7.5;
        const totalTravel = 1 + (totalCards / travelFactor);
        const adjustedProgress = (progress * totalTravel - 0.8) * 0.75;

        DOMCache.clickableCards.forEach((card, i) => {
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

            gsap.set(card, {
                x,
                y: -y + radius,
                rotation: -rotation,
                transformOrigin: "center center",
                opacity: cardOpacity,
                pointerEvents: cardOpacity > 0.5 ? 'auto' : 'none'

            });
        });
        DOMCache.allCards.forEach(card => {
            if (card.classList.contains('empty')) gsap.set(card, {
                opacity: 0,
                pointerEvents: 'none'
            });
        });
    }

    positionCards(0);

    const observerOptions = {
        root: null,
        rootMargin: "0% 0% -50% 0%",
        threshold: 0.1
    };
    const observerCallback = (entries) => {
        let topIntersectingCardIndex = -1;
        let maxIntersectionRatio = 0;
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight * 0.6) {
                let cardIndex = DOMCache.clickableCards.indexOf(entry.target);
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
            if (currentCardIndex >= 0 && currentCardIndex < DOMCache.genreH1s.length) {
                const h1Height = DOMCache.genreH1s[0].offsetHeight;
                if (h1Height > 0) {
                    const targetY = -currentCardIndex * h1Height;
                    gsap.to(DOMCache.countContainer, {
                        y: targetY,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: true
                    });
                }
            }
        }
    };
    const cardObserver = new IntersectionObserver(observerCallback, observerOptions);
    DOMCache.clickableCards.forEach(card => cardObserver.observe(card));

    DOMCache.clickableCards.forEach(card => {
        card.addEventListener('pointerup', () => {
            if (parseFloat(window.getComputedStyle(card).opacity) < 0.5) return;
            const imgElement = card.querySelector('.bg-image');
            if (imgElement?.alt) {
                applyTheme(imgElement.alt);
            }
        });
    });

    const debouncedResizeHandler = debounce(() => {
        console.log("Resizing - Refreshing ScrollTrigger and repositioning cards.");
        ScrollTrigger.refresh();
        const currentProgress = cardScrollTrigger?.progress || 0;
        positionCards(currentProgress);
        if (currentCardIndex >= 0 && currentCardIndex < DOMCache.genreH1s.length) {
            const h1Height = DOMCache.genreH1s[0].offsetHeight;
            if (h1Height > 0) {
                gsap.set(DOMCache.countContainer, {
                    y: -currentCardIndex * h1Height
                });
            }
        }
    }, 250);
    window.addEventListener("resize", debouncedResizeHandler);
}

function initGenreFilter() {
    if (!DOMCache.filterMobileContainer || DOMCache.genreH1s.length === 0) {
        console.warn("Genre filter setup skipped: Missing elements.");
        if (DOMCache.filterMobileElement) DOMCache.filterMobileElement.style.display = 'none';
        return;
    }
    DOMCache.filterMobileContainer.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.className = 'genre-filter-button active';
    allButton.textContent = 'All';
    allButton.dataset.genre = 'All';
    DOMCache.filterMobileContainer.appendChild(allButton);
    const uniqueGenres = [...new Set(DOMCache.genreH1s.map(h1 => h1.textContent.trim()))];
    uniqueGenres.forEach(genre => {
        if (!genre) return;
        const button = document.createElement('button');
        button.className = 'genre-filter-button';
        button.textContent = genre;
        button.dataset.genre = genre;
        DOMCache.filterMobileContainer.appendChild(button);
    });
    DOMCache.filterMobileContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('genre-filter-button') && !e.target.classList.contains('active')) {
            const selectedGenre = e.target.dataset.genre;
            DOMCache.filterMobileContainer.querySelectorAll('.genre-filter-button').forEach(btn => {
                btn.classList.toggle('active', btn === e.target);
            });
            const themeNameToApply = genreToThemeMap[selectedGenre] || genreToThemeMap["All"];
            applyTheme(themeNameToApply);
        }
    });
    console.log("Genre filter setup complete.");
}

// Trending section slider 3d code bht halat kharab ho gyi bhai isme

function init3dGallery() {

    if (!DOMCache.entryOverlay || !DOMCache.galleryContainer || !DOMCache.gallerySliderElement || !DOMCache.gallerySection) {
        console.error("3D Gallery Init Failed: Missing elements.");
        if (DOMCache.gallerySection) DOMCache.gallerySection.style.display = 'none';
        return;
    }
    if (typeof slides === 'undefined' || !slides || slides.length === 0) {
        console.error("3D Gallery Init Failed: Missing data.");
        if (DOMCache.gallerySection) DOMCache.gallerySection.style.display = 'none';
        return;
    }

    const totalSlides = Math.min(slides.length, 10);
    const zStep = 2500;
    const initialZ = -(totalSlides * zStep);

    function generateSlides() {
        if (!DOMCache.gallerySliderElement) {
            console.error("DOMCache.gallerySliderElement not found.");
            return;
        }
        DOMCache.gallerySliderElement.innerHTML = "";
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < totalSlides; i++) {
            const slideData = slides[i];
            if (!slideData?.id || !slideData?.title) continue;
            const imageNumber = (i % 10) + 1;
            const imageFilename = `./timg${imageNumber}.png`;
            const slide = document.createElement("div");
            slide.className = "slide";
            slide.id = `gallery-slide-${i + 1}`;
            slide.innerHTML = `<div class="slide-img"><img src="${imageFilename}" alt="${slideData.title}" loading="lazy" width="325" height="710"></div><div class="slide-copy"><p>${slideData.title}</p><p>${slideData.id}</p></div>`;
            fragment.appendChild(slide);
            const xPosition = i % 2 === 0 ? "45%" : "55%";
            gsap.set(slide, {
                position: 'absolute',
                top: "50%",
                left: xPosition,
                xPercent: -50,
                yPercent: -50,
                z: initialZ + i * zStep,
                opacity: 0,
                willChange: 'transform, opacity'
            });
        }
        DOMCache.gallerySliderElement.appendChild(fragment);
        console.log(`${DOMCache.gallerySliderElement.children.length} gallery slides generated.`);
    }

    function mapRange(v, iM, iX, oM, oX) {
        return iM === iX ? oM : ((v - iM) * (oX - oM)) / (iX - iM) + oM;
    }

    function setupGalleryAnimation() {
        const allSlides = gsap.utils.toArray("#trending .slide");
        if (allSlides.length === 0) return;

        ScrollTrigger.getAll().forEach(st => {
            if (st.vars.id && st.vars.id.startsWith("gallery")) {
                st.kill();
            }
        });

        const endScroll = (totalSlides + 1) * window.innerHeight * 1.5;

        ScrollTrigger.create({
            id: "galleryPin",
            trigger: DOMCache.gallerySection,
            start: "top top",
            end: () => `+=${endScroll}`,
            pin: DOMCache.gallerySliderElement,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
        });

        allSlides.forEach((slide, index) => {
            const slideInitialZ = initialZ + index * zStep;
            const copy = slide.querySelector('.slide-copy');
            const requiredMovement = Math.abs(initialZ) + zStep * 1.5;

            ScrollTrigger.create({
                id: `gallerySlideAnim-${index}`,
                trigger: DOMCache.gallerySection,
                scrub: true,
                start: "top top",
                end: () => `+=${endScroll}`,
                onUpdate: (self) => {

                    const currentZ = slideInitialZ + self.progress * requiredMovement;

                    const fadeEnd = 0,
                        fadeOutStart = -zStep * 1.5,
                        fadeInEnd = zStep * 1.2;
                    let opacity = 1;
                    if (currentZ > fadeEnd) opacity = mapRange(currentZ, fadeEnd, fadeInEnd, 1, 0);
                    else opacity = mapRange(currentZ, fadeOutStart, fadeEnd, 0, 1);
                    opacity = Math.max(0, Math.min(1, opacity));

                    gsap.set(slide, {
                        z: currentZ,
                        opacity: opacity
                    });

                    if (copy) {
                        let copyOpacity = mapRange(opacity, 0.6, 1, 0, 1);
                        if (currentZ < -zStep * 0.2) copyOpacity = 0;
                        gsap.set(copy, {
                            opacity: Math.max(0, Math.min(1, copyOpacity))
                        });
                    }
                }
            });
        });
        ScrollTrigger.refresh();
        console.log("Gallery ScrollTriggers initialized/refreshed (Original Logic).");

        if (lenis?.scrollTo && document.body.contains(DOMCache.gallerySection)) {
            setTimeout(() => {
                lenis.scrollTo(DOMCache.gallerySection, {
                    offset: 5,
                    duration: 1.2,
                    onComplete: () => console.log("Scrolled to gallery section.")
                });
            }, 250);
        }
    }

    DOMCache.entryOverlay.addEventListener("click", () => {
        if (DOMCache.entryOverlay.classList.contains('opening') || DOMCache.entryOverlay.classList.contains('hiding')) return;
        DOMCache.entryOverlay.classList.add('opening');
        const splitLeft = document.getElementById('split-left');
        let transitionEnded = false;
        const onOverlayOpened = () => {
            if (transitionEnded) return;
            transitionEnded = true;
            clearTimeout(transitionTimeout);
            DOMCache.entryOverlay.classList.add('hiding');
            if (DOMCache.galleryContainer) {
                DOMCache.galleryContainer.classList.add('active');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setupGalleryAnimation();
                    });
                });
            } else {
                console.error("Gallery container missing!");
            }
        };
        const transitionTimeout = setTimeout(onOverlayOpened, 1100);
        if (splitLeft) {
            splitLeft.addEventListener('transitionend', onOverlayOpened, {
                once: true
            });
        } else {
            setTimeout(onOverlayOpened, 950);
        }
    }, {
        once: true
    });

    generateSlides();
    console.log("3D Gallery Initialized.");
}
// Top movies and languages wala slider

function initializeCarousel(carouselElement) {

    const sliderContent = carouselElement?.querySelector('.slider-content');
    const prevButton = carouselElement?.querySelector('.prev');
    const nextButton = carouselElement?.querySelector('.next');
    const carouselId = carouselElement?.id || 'unknown_carousel';

    if (!carouselElement || !sliderContent || !prevButton || !nextButton) {
        console.warn(`Carousel elements missing for container '${carouselId}'. Skipping init.`);
        return null;
    }
    const items = Array.from(sliderContent.querySelectorAll('li'));
    if (items.length === 0) {
        console.warn(`No items found in carousel list for container '${carouselId}'. Skipping init.`);
        return null;
    }

    items.forEach(item => {
        const infoBox = item.querySelector('.movie-info-hover');
        if (!infoBox) return;
        const titleEl = infoBox.querySelector('.info-title');
        const descEl = infoBox.querySelector('.info-description');
        const tagEl = infoBox.querySelector('.info-tag');
        if (titleEl) titleEl.textContent = item.dataset.title || '';
        if (descEl) {
            const description = item.dataset.description || '';
            descEl.textContent = description;
            descEl.style.display = description ? '' : 'none';
        }
        if (tagEl) {
            const tagText = item.dataset.tag || '';
            tagEl.textContent = tagText;
            tagEl.style.display = tagText ? '' : 'none';
        }
        item.setAttribute('tabindex', '0');
    });

    let isAnimating = false;

    const getItemsPerSlide = () => (window.innerWidth <= 768) ? 1 : 2;

    const nextSlideCarousel = () => {
        if (isAnimating) return;
        isAnimating = true;
        sliderContent.classList.add('next-animation');
        const itemsToSlide = getItemsPerSlide();
        const percentageToSlide = 100;

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
                gsap.set(sliderContent, {
                    xPercent: 0
                });
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

        gsap.set(sliderContent, {
            xPercent: -percentageToSlide
        });

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

    console.log(`Carousel initialized for container '${carouselId}' (Original Logic).`);

    return null;
}

function initCarousels() {

    if (!DOMCache.allCarouselContainers || DOMCache.allCarouselContainers.length === 0) {
        console.warn("No '.carousel-container' elements found.");
        return;
    }
    console.log(`Found ${DOMCache.allCarouselContainers.length} carousels. Initializing...`);
    DOMCache.allCarouselContainers.forEach(container => {
        requestAnimationFrame(() => initializeCarousel(container));
    });
}

function initializeMainWebsite() {
    if (isInitialized) {
        console.warn("Initialization already ran.");
        return;
    }
    isInitialized = true;
    console.log("Initializing main website...");

    queryDOMElements();
    initLenis();
    initScrollToTop();
    initSearch();
    initMenu();
    initDynamicOverlayContent();

    requestAnimationFrame(() => {
        console.log("Deferred initialization started.");
        initIntroAnimation();
        initStickyCards();
        initGenreFilter();
        init3dGallery();
        initCarousels();

        if (DOMCache.contactForm) {
            DOMCache.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log("Contact form submitted (Placeholder Action)");
                alert("Message submitted (placeholder)!");
                DOMCache.contactForm.reset();
            });
        }
    });
    console.log("Main website initialization sequence complete (core setup).");
}

function validateSignupPasswordMatch() {
    if (!DOMCache.signupPassword || !DOMCache.signupConfirmPassword || !DOMCache.signupConfirmPassMsg) return true;
    const password = DOMCache.signupPassword.value;
    const confirmPassword = DOMCache.signupConfirmPassword.value;
    const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--signup-error-color').trim() || '#e74c3c';
    if (confirmPassword.length > 0 && password !== confirmPassword) {
        DOMCache.signupConfirmPassword.setCustomValidity("Passwords don't match");
        DOMCache.signupConfirmPassMsg.textContent = "Passwords don't match";
        DOMCache.signupConfirmPassMsg.style.color = errorColor;
        return false;
    } else {
        DOMCache.signupConfirmPassword.setCustomValidity('');
        DOMCache.signupConfirmPassMsg.textContent = "";
        DOMCache.signupConfirmPassMsg.style.color = '';
        return true;
    }
}

function checkSignupFormValidityAndUpdateButton() {
    if (!DOMCache.signupForm || !DOMCache.signupSubmitButton) return;
    const passwordsMatch = validateSignupPasswordMatch();
    const isFormValid = DOMCache.signupForm.checkValidity();
    DOMCache.signupSubmitButton.disabled = !(isFormValid && passwordsMatch);
}

function setupSignupValidation() {
    queryDOMElements();
    if (!DOMCache.signupPassword || !DOMCache.signupConfirmPassword || !DOMCache.signupForm) {
        console.warn("Signup validation elements missing.");
        return;
    }
    [DOMCache.signupPassword, DOMCache.signupConfirmPassword, ...DOMCache.signupForm.querySelectorAll('input:not([type="password"])')]
    .forEach(input => {
        input.addEventListener('input', checkSignupFormValidityAndUpdateButton);
    });
    DOMCache.signupConfirmPassword.addEventListener('blur', checkSignupFormValidityAndUpdateButton);
    DOMCache.signupPassword.addEventListener('blur', checkSignupFormValidityAndUpdateButton);
    checkSignupFormValidityAndUpdateButton();
}

function handleSignupSuccess(event) {
    event.preventDefault();
    if (!DOMCache.signupSubmitButton || DOMCache.signupSubmitButton.disabled) {
        console.warn("Signup attempt while button disabled.");
        if (DOMCache.signupForm) {
            gsap.fromTo(DOMCache.signupForm, {
                x: -8
            }, {
                x: 8,
                clearProps: "x",
                duration: 0.08,
                repeat: 5
            });
        }
        return;
    }
    console.log("Signup valid, proceeding...");
    DOMCache.signupSubmitButton.disabled = true;
    DOMCache.signupSubmitButton.textContent = "Loading...";
    gsap.to(DOMCache.signupSection, {
        opacity: 0,
        duration: 0.6,
        ease: "power1.in",
        onComplete: () => {
            gsap.set(DOMCache.signupSection, {
                display: 'none'
            });
            if (DOMCache.mainWebsiteContent) {
                gsap.set(DOMCache.mainWebsiteContent, {
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1
                });
                console.log("Signup hidden, Main content container visible.");
                initializeMainWebsite();
            } else {
                console.error("Main website content container not found!");
                document.body.innerHTML = "<p>Error loading content.</p>";
            }
        }
    });
}

// baki js handle kr lega

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded");

    if (typeof CustomEase !== 'undefined') {
        gsap.registerPlugin(CustomEase);
        CustomEase.create("hop", "0.9, 0, 0.1, 1");
        CustomEase.create("hop2", "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1");
    } else {
        console.warn("GSAP CustomEase not found.");
    }
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.warn("GSAP ScrollTrigger not found.");
    }

    setupSignupValidation();

    if (DOMCache.signupSubmitButton) {
        DOMCache.signupSubmitButton.addEventListener('click', handleSignupSuccess);
    } else {
        console.error("Signup submit button not found. Cannot proceed.");
    }
});