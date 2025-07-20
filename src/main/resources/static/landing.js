// 全局变量
let isScrolled = false
let currentSection = "home"

// DOM加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// 初始化应用
function initializeApp() {
  initializeNavigation()
  initializeScrollEffects()
  initializeAnimations()
  initializeCounters()
  initializeTypingEffect()
  initializeParallax()
  bindEventListeners()
}

// 初始化导航
function initializeNavigation() {
  const navbar = document.getElementById("navbar")
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")
  const navLinks = document.querySelectorAll(".nav-link")

  // 滚动时导航栏样式变化
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset

    if (scrollTop > 100 && !isScrolled) {
      navbar.classList.add("scrolled")
      isScrolled = true
    } else if (scrollTop <= 100 && isScrolled) {
      navbar.classList.remove("scrolled")
      isScrolled = false
    }

    // 更新活跃导航项
    updateActiveNavItem()
  })

  // 移动端菜单切换
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active")
    navToggle.classList.toggle("active")
  })

  // 导航链接点击事件
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetSection = document.getElementById(targetId)

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }

      // 移动端关闭菜单
      navMenu.classList.remove("active")
      navToggle.classList.remove("active")
    })
  })
}

// 更新活跃导航项
function updateActiveNavItem() {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(".nav-link")

  let current = ""

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight

    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id")
    }
  })

  if (current !== currentSection) {
    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active")
      }
    })
    currentSection = current
  }
}

// 初始化滚动效果
function initializeScrollEffects() {
  const backToTop = document.getElementById("back-to-top")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset

    // 返回顶部按钮显示/隐藏
    if (scrollTop > 500) {
      backToTop.classList.add("visible")
    } else {
      backToTop.classList.remove("visible")
    }
  })

  // 返回顶部点击事件
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// 初始化动画
function initializeAnimations() {
  // 简单的AOS动画实现
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("aos-animate")
      }
    })
  }, observerOptions)

  // 观察所有带有data-aos属性的元素
  document.querySelectorAll("[data-aos]").forEach((el) => {
    observer.observe(el)
  })
}

// 初始化计数器动画
function initializeCounters() {
  const counters = document.querySelectorAll(".stat-number[data-count]")
  let countersAnimated = false

  const animateCounters = () => {
    if (countersAnimated) return

    counters.forEach((counter) => {
      const target = Number.parseInt(counter.getAttribute("data-count"))
      const duration = 2000 // 2秒
      const increment = target / (duration / 16) // 60fps
      let current = 0

      const updateCounter = () => {
        current += increment
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString()
          requestAnimationFrame(updateCounter)
        } else {
          counter.textContent = target.toLocaleString()
        }
      }

      updateCounter()
    })

    countersAnimated = true
  }

  // 当统计区域进入视口时开始动画
  const statsSection = document.querySelector(".hero-stats")
  if (statsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters()
          }
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(statsSection)
  }
}

// 初始化打字效果
function initializeTypingEffect() {
  const typingElement = document.querySelector(".typing-text")
  if (!typingElement) return

  const texts = ["明日清单", "智能规划", "高效管理", "未来助手"]
  let textIndex = 0
  let charIndex = 0
  let isDeleting = false

  function typeText() {
    const currentText = texts[textIndex]

    if (isDeleting) {
      typingElement.textContent = currentText.substring(0, charIndex - 1)
      charIndex--
    } else {
      typingElement.textContent = currentText.substring(0, charIndex + 1)
      charIndex++
    }

    let typeSpeed = isDeleting ? 100 : 200

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000 // 停留时间
      isDeleting = true
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      textIndex = (textIndex + 1) % texts.length
      typeSpeed = 500
    }

    setTimeout(typeText, typeSpeed)
  }

  // 延迟开始打字效果
  setTimeout(typeText, 1000)
}

// 初始化视差效果
function initializeParallax() {
  const orbs = document.querySelectorAll(".gradient-orb")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset

    orbs.forEach((orb, index) => {
      const speed = 0.5 + index * 0.1
      const yPos = -(scrollTop * speed)
      orb.style.transform = `translateY(${yPos}px)`
    })
  })
}

// 绑定事件监听器
function bindEventListeners() {
  // 登录按钮
  const loginBtn = document.getElementById("login-btn")
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      // 这里填入你的应用URL
      window.location.href = "http://anmory.com:8092" // 替换为你的应用URL
    })
  }

  // 开始使用按钮
  const startBtns = document.querySelectorAll("#start-btn, #hero-start-btn")
  startBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 这里填入你的应用URL
      window.location.href = "http://anmory.com:8092" // 替换为你的应用URL
    })
  })

  // 演示按钮
  const demoBtn = document.getElementById("demo-btn")
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      // 可以添加演示视频或功能展示
      showDemo()
    })
  }

  // 表单提交
  const contactForm = document.querySelector(".form")
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit)
  }

  // 定价卡片悬停效果
  const pricingCards = document.querySelectorAll(".pricing-card")
  pricingCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-12px) scale(1.02)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)"
    })
  })

  // 功能卡片交互效果
  const featureCards = document.querySelectorAll(".feature-card")
  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const icon = card.querySelector(".feature-icon")
      icon.style.transform = "scale(1.1) rotate(5deg)"
    })

    card.addEventListener("mouseleave", () => {
      const icon = card.querySelector(".feature-icon")
      icon.style.transform = "scale(1) rotate(0deg)"
    })
  })
}

// 显示演示
function showDemo() {
  // 创建模态框显示演示内容
  const modal = document.createElement("div")
  modal.className = "demo-modal"
  modal.innerHTML = `
        <div class="demo-modal-backdrop"></div>
        <div class="demo-modal-content">
            <div class="demo-modal-header">
                <h3>产品演示</h3>
                <button class="demo-modal-close">&times;</button>
            </div>
            <div class="demo-modal-body">
                <div class="demo-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <h4>演示视频即将上线</h4>
                    <p>我们正在制作精彩的产品演示视频，敬请期待！</p>
                    <button class="btn-primary" onclick="closeDemo()">了解更多</button>
                </div>
            </div>
        </div>
    `

  // 添加样式
  const style = document.createElement("style")
  style.textContent = `
        .demo-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        
        .demo-modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
        }
        
        .demo-modal-content {
            position: relative;
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-2xl);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            backdrop-filter: blur(20px);
            animation: slideUp 0.3s ease-out;
        }
        
        .demo-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .demo-modal-header h3 {
            color: var(--text-primary);
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .demo-modal-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 2rem;
            cursor: pointer;
            transition: var(--transition-fast);
        }
        
        .demo-modal-close:hover {
            color: var(--text-primary);
        }
        
        .demo-modal-body {
            padding: 3rem 2rem;
        }
        
        .demo-placeholder {
            text-align: center;
        }
        
        .demo-placeholder i {
            font-size: 4rem;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
        }
        
        .demo-placeholder h4 {
            color: var(--text-primary);
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .demo-placeholder p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `

  document.head.appendChild(style)
  document.body.appendChild(modal)

  // 绑定关闭事件
  const closeBtn = modal.querySelector(".demo-modal-close")
  const backdrop = modal.querySelector(".demo-modal-backdrop")

  const closeModal = () => {
    modal.style.animation = "fadeOut 0.3s ease-out"
    setTimeout(() => {
      document.body.removeChild(modal)
      document.head.removeChild(style)
    }, 300)
  }

  closeBtn.addEventListener("click", closeModal)
  backdrop.addEventListener("click", closeModal)

  // 全局关闭函数
  window.closeDemo = closeModal
}

// 处理表单提交
function handleFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData)

  // 显示提交成功消息
  showNotification("消息发送成功！我们会尽快回复您。", "success")

  // 重置表单
  e.target.reset()
}

// 显示通知
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-info-circle"}"></i>
            <span>${message}</span>
        </div>
    `

  // 添加样式
  const style = document.createElement("style")
  style.textContent = `
        .notification {
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 1rem 1.5rem;
            backdrop-filter: blur(20px);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: var(--shadow-lg);
        }
        
        .notification-success {
            border-left: 4px solid var(--success-color);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-primary);
        }
        
        .notification-success i {
            color: var(--success-color);
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `

  document.head.appendChild(style)
  document.body.appendChild(notification)

  // 3秒后自动移除
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
        document.head.removeChild(style)
      }
    }, 300)
  }, 3000)
}

// 添加一些额外的交互效果
document.addEventListener("mousemove", (e) => {
  const orbs = document.querySelectorAll(".gradient-orb")
  const mouseX = e.clientX / window.innerWidth
  const mouseY = e.clientY / window.innerHeight

  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 0.02
    const x = (mouseX - 0.5) * speed * 100
    const y = (mouseY - 0.5) * speed * 100

    orb.style.transform += ` translate(${x}px, ${y}px)`
  })
})

// 添加键盘导航支持
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // 关闭任何打开的模态框
    const modals = document.querySelectorAll(".demo-modal")
    modals.forEach((modal) => {
      if (window.closeDemo) {
        window.closeDemo()
      }
    })
  }
})

// 性能优化：节流滚动事件
function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 应用节流到滚动事件
window.addEventListener(
  "scroll",
  throttle(() => {
    // 滚动相关的处理已经在其他函数中定义
  }, 16),
) // 约60fps
