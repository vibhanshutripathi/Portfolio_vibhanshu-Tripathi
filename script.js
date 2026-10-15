// ---------- Some values used in many places ----------
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var hasObserver = "IntersectionObserver" in window;
var fineMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


// ---------- Loading screen ----------
var loader = document.getElementById("loader");
var loaderText = document.getElementById("loader-text");
var loaderMessages = ["initializing...", "loading projects...", "ready"];
var pageStartTime = Date.now();

// change the small text under the loading bar
for (var m = 0; m < loaderMessages.length; m++) {
  (function (index) {
    setTimeout(function () {
      loaderText.textContent = loaderMessages[index];
    }, index * 450);
  })(m);
}

function hideLoader() {
  var minTime = reduceMotion ? 0 : 1300;
  var wait = Math.max(0, minTime - (Date.now() - pageStartTime));

  setTimeout(function () {
    loader.classList.add("hide");
  }, wait);
}

if (document.readyState === "complete") {
  hideLoader();
} else {
  window.addEventListener("load", hideLoader);
}


// ---------- Dark / light theme ----------
var themeButton = document.getElementById("theme");
var rootElement = document.documentElement;
var themeColorMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
  rootElement.setAttribute("data-theme", theme);

  if (theme === "dark") {
    themeButton.textContent = "🌙";
    themeColorMeta.setAttribute("content", "#070a16");
  } else {
    themeButton.textContent = "☀️";
    themeColorMeta.setAttribute("content", "#f3f6fc");
  }
}

// show the correct icon when the page opens
if (rootElement.getAttribute("data-theme") === "light") {
  setTheme("light");
} else {
  setTheme("dark");
}

themeButton.addEventListener("click", function () {
  var newTheme = rootElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(newTheme);

  try {
    localStorage.setItem("theme", newTheme);
  } catch (e) {
    // storage is not available, so just ignore it
  }
});


// ---------- Toast message ----------
var toast = document.getElementById("toast");
var toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3200);
}


// ---------- Mobile menu ----------
var burger = document.getElementById("burger");
var menu = document.getElementById("menu");
var menuLinks = menu.querySelectorAll("a");

function setMenuOpen(isOpen) {
  if (isOpen) {
    menu.classList.add("open");
  } else {
    menu.classList.remove("open");
  }
  burger.setAttribute("aria-expanded", String(isOpen));
}

burger.addEventListener("click", function () {
  setMenuOpen(!menu.classList.contains("open"));
});

// close the menu after a link is clicked
for (var i = 0; i < menuLinks.length; i++) {
  menuLinks[i].addEventListener("click", function () {
    setMenuOpen(false);
  });
}

// close the menu with the Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    setMenuOpen(false);
  }
});


// ---------- Scroll: progress bar, navbar border, back to top ----------
var progressBar = document.querySelector(".progress");
var navbar = document.getElementById("nav");
var toTopButton = document.querySelector(".to-top");

function onScroll() {
  var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  var scrolled = window.scrollY;
  var percent = 0;

  if (maxScroll > 0) {
    percent = Math.min(scrolled / maxScroll, 1);
  }

  progressBar.style.setProperty("--p", percent.toFixed(4));

  navbar.classList.toggle("scrolled", scrolled > 10);
  toTopButton.classList.toggle("show", scrolled > 600);
}

window.addEventListener("scroll", onScroll);
onScroll();


// ---------- Reveal items while scrolling ----------
var revealItems = document.querySelectorAll(".reveal");

if (hasObserver && !reduceMotion) {
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

  revealItems.forEach(function (item) {
    revealObserver.observe(item);
  });
} else {
  // no animation: just show everything
  revealItems.forEach(function (item) {
    item.classList.add("visible");
  });
}


// ---------- Highlight the current section in the navbar ----------
var pageSections = document.querySelectorAll("main section[id]");

if (hasObserver) {
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        menuLinks.forEach(function (link) {
          var isCurrent = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", isCurrent);
        });
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });

  pageSections.forEach(function (section) {
    sectionObserver.observe(section);
  });
}


// ---------- Typing effect in the hero ----------
var typedElement = document.getElementById("typed");
var typedWords = [ "MERN Stack Developer", "React.js Developer", "REST API Builder"];
var wordIndex = 0;
var letterIndex = 0;
var isDeleting = false;

function typeEffect() {
  var word = typedWords[wordIndex];

  if (isDeleting) {
    letterIndex--;
  } else {
    letterIndex++;
  }

  typedElement.textContent = word.slice(0, letterIndex);

  var delay = isDeleting ? 38 : 85;

  if (!isDeleting && letterIndex === word.length) {
    // the word is complete, wait and then start deleting
    isDeleting = true;
    delay = 1700;
  } else if (isDeleting && letterIndex === 0) {
    // the word is deleted, move to the next one
    isDeleting = false;
    wordIndex = (wordIndex + 1) % typedWords.length;
    delay = 400;
  }

  setTimeout(typeEffect, delay);
}

if (reduceMotion) {
  typedElement.textContent = typedWords[0];
} else {
  setTimeout(typeEffect, 1400);
}


// ---------- Count-up numbers ----------
var counters = document.querySelectorAll(".count");

function showNumber(element, value) {
  var decimals = Number(element.getAttribute("data-dec") || 0);
  element.textContent = value.toFixed(decimals);
}

function countUp(element) {
  var target = Number(element.getAttribute("data-to"));

  if (reduceMotion) {
    showNumber(element, target);
    return;
  }

  var duration = 1800;
  var startTime = Date.now();

  function update() {
    var progress = Math.min((Date.now() - startTime) / duration, 1);
    // easing: starts fast and slows down at the end
    var eased = 1 - Math.pow(1 - progress, 4);

    showNumber(element, target * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}

if (hasObserver) {
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        countUp(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });
} else {
  counters.forEach(function (counter) {
    showNumber(counter, Number(counter.getAttribute("data-to")));
  });
}


// ---------- Timeline line grows when it comes into view ----------
var timeline = document.getElementById("timeline");

if (hasObserver && !reduceMotion) {
  var timelineObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        timeline.classList.add("drawn");
        timelineObserver.disconnect();
      }
    });
  }, { threshold: 0.15 });

  timelineObserver.observe(timeline);
} else {
  timeline.classList.add("drawn");
}


// ---------- Cursor dot + ring, and glow on cards (mouse only) ----------
var cursorDot = document.getElementById("cursor-dot");
var cursorRing = document.getElementById("cursor-ring");
var mouseX = 0;
var mouseY = 0;
var ringX = 0;
var ringY = 0;
var cursorStarted = false;

if (fineMouse) {
  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") {
      return;
    }

    mouseX = e.clientX;
    mouseY = e.clientY;

    // card glow follows the mouse
    var card = e.target.closest(".spot");
    if (card) {
      var box = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - box.left) + "px");
      card.style.setProperty("--my", (e.clientY - box.top) + "px");
    }

    if (reduceMotion) {
      return;
    }

    // first mouse move: show the cursor
    if (!cursorStarted) {
      ringX = mouseX;
      ringY = mouseY;
      cursorStarted = true;
      cursorDot.classList.add("on");
      cursorRing.classList.add("on");
    }

    cursorDot.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";

    // ring gets bigger on links, buttons and cards
    var overClickable = e.target.closest("a, button, input, textarea, .spot");
    cursorRing.classList.toggle("big", overClickable !== null);
  });

  // hide the cursor when the mouse leaves the page
  document.documentElement.addEventListener("mouseleave", function () {
    cursorDot.classList.remove("on");
    cursorRing.classList.remove("on");
    cursorStarted = false;
  });

  // the ring follows the dot a little slowly
  if (!reduceMotion) {
    function moveRing() {
      ringX = ringX + (mouseX - ringX) * 0.16;
      ringY = ringY + (mouseY - ringY) * 0.16;
      cursorRing.style.transform = "translate(" + ringX + "px, " + ringY + "px)";
      requestAnimationFrame(moveRing);
    }

    moveRing();
  }
}


// ---------- Contact form (opens the email app) ----------
var contactForm = document.getElementById("form");
var myEmail = "vibhanshutripathi49@gmail.com";

contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var firstName = document.getElementById("fn").value.trim();
  var lastName = document.getElementById("ln").value.trim();
  var emailInput = document.getElementById("em");
  var subject = document.getElementById("sj").value.trim();
  var messageInput = document.getElementById("ms");

  emailInput.classList.remove("bad");
  messageInput.classList.remove("bad");

  // simple check: text@text.text
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var emailIsValid = emailPattern.test(emailInput.value.trim());
  var messageIsValid = messageInput.value.trim() !== "";

  if (!emailIsValid) {
    emailInput.classList.add("bad");
  }

  if (!messageIsValid) {
    messageInput.classList.add("bad");
  }

  if (!emailIsValid || !messageIsValid) {
    showToast("Please add a valid email and a message.");
    return;
  }

  var fullName = (firstName + " " + lastName).trim();
  var mailSubject = subject || "Portfolio inquiry";
  var mailBody = messageInput.value.trim() + "\n\n- " + (fullName || "Anonymous") + "\n" + emailInput.value.trim();

  window.location.href =
    "mailto:" + myEmail +
    "?subject=" + encodeURIComponent(mailSubject) +
    "&body=" + encodeURIComponent(mailBody);

  showToast("Opening your email app...");
});


// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();