// 全局变量
let currentUser = null
let currentPage = "dashboard"
let currentTheme = "light"
let pendingTodos = [] // 待审核的AI生成待办
const $ = window.jQuery
let currentWallpaper = null // 当前壁纸路径

// API 基础URL
const API_BASE = ""

// 初始化应用
$(document).ready(() => {
  initializeApp()
})

// 应用初始化
function initializeApp() {
  // 隐藏加载动画
  setTimeout(() => {
    $("#loading").addClass("hidden")
  }, 1500)

  // 检查本地存储的用户信息
  checkLocalUser()

  // 初始化主题
  initializeTheme()

  // 绑定事件
  bindEvents()

  // 设置当前日期
  updateCurrentDate()
}

// 检查本地用户信息
function checkLocalUser() {
  const userData = localStorage.getItem("todoapp_user")
  if (userData) {
    try {
      currentUser = JSON.parse(userData)
      if (currentUser && currentUser.username && currentUser.password) {
        console.log("发现本地用户信息，尝试自动登录...")
        autoLogin()
      } else {
        console.log("本地用户信息无效，清除并显示登录页面")
        localStorage.removeItem("todoapp_user")
        currentUser = null
        showAuthPage()
      }
    } catch (e) {
      console.log("解析本地用户信息失败，清除并显示登录页面")
      localStorage.removeItem("todoapp_user")
      currentUser = null
      showAuthPage()
    }
  } else {
    console.log("没有本地用户信息，显示登录页面")
    showAuthPage()
  }
}

// 自动登录
function autoLogin() {
  if (!currentUser) {
    showAuthPage()
    return
  }

  console.log("尝试自动登录用户:", currentUser.username)

  $.ajax({
    url: `${API_BASE}/user/login`,
    method: "POST",
    data: {
      username: currentUser.username,
      password: currentUser.password,
    },
    success: (response) => {
      console.log("自动登录响应:", response)
      if (response && (response.userId || response.user_id) && response !== false) {
        currentUser = response
        localStorage.setItem(
          "todoapp_user",
          JSON.stringify({
            ...currentUser,
            username: currentUser.username,
            password: currentUser.password,
          }),
        )
        console.log("自动登录成功，显示主应用")
        showMainApp()
      } else {
        console.log("自动登录失败，清除本地存储")
        localStorage.removeItem("todoapp_user")
        currentUser = null
        showAuthPage()
      }
    },
    error: (xhr, status, error) => {
      console.log("自动登录网络错误:", error)
      localStorage.removeItem("todoapp_user")
      currentUser = null
      showAuthPage()
    },
  })
}

// 显示主应用
function showMainApp() {
  console.log("显示主应用", currentUser)
  $("#auth-page").removeClass("active").hide()
  $("#main-app").addClass("active").show()

  // 更新用户信息显示
  if (currentUser) {
    const username = currentUser.username || "用户"
    const email = currentUser.email || "user@example.com"
    $("#user-name").text(username)
    $("#user-email").text(email)
    $("#user-initial").text(username.charAt(0).toUpperCase())

    // 加载用户壁纸
    loadUserWallpaper()
  }

  // 延迟加载数据确保DOM已更新
  setTimeout(() => {
    loadDashboardData()
  }, 100)
}

// 初始化主题
function initializeTheme() {
  const savedTheme = localStorage.getItem("todoapp_theme") || "light"
  currentTheme = savedTheme
  document.documentElement.setAttribute("data-theme", currentTheme)
  updateThemeIcon()
}

// 更新主题图标
function updateThemeIcon() {
  const icon = currentTheme === "light" ? "fa-moon" : "fa-sun"
  $("#theme-toggle i").removeClass("fa-moon fa-sun").addClass(icon)
}

// 绑定事件
function bindEvents() {
  // 登录表单
  $("#login-form form").on("submit", handleLogin)

  // 注册表单
  $("#register-form form").on("submit", handleRegister)

  // 主题切换
  $("#theme-toggle").on("click", toggleTheme)

  // 移动端菜单
  $("#mobile-menu-btn").on("click", toggleMobileNav)
  $("#mobile-nav-overlay").on("click", closeMobileNav)

  // 用户菜单
  $("#user-menu-btn").on("click", toggleUserMenu)
  $(document).on("click", (e) => {
    if (!$(e.target).closest(".user-menu").length) {
      $("#user-dropdown").removeClass("active")
    }
  })

  // 登出
  $("#logout-btn").on("click", handleLogout)

  // 导航菜单
  $(".nav-item").on("click", handleNavClick)

  // 添加任务按钮
  $("#add-overall-btn").on("click", () => openModal("task-form-modal"))

  // 添加总结按钮
  $("#add-summary-btn").on("click", () => openModal("summary-form-modal"))

  // 任务表单提交
  $("#task-form").on("submit", handleTaskSubmit)

  // 总结表单提交
  $("#summary-form").on("submit", handleSummarySubmit)

  // AI功能按钮
  $("#generate-todos-btn").on("click", generateTodos)
  $("#generate-summary-btn").on("click", generateSummary)

  // AI审核按钮
  $("#regenerate-todos-btn").on("click", regenerateTodos)
  $("#confirm-todos-btn").on("click", confirmTodos)

  // 模态框关闭
  $(".modal-close").on("click", function () {
    closeModal($(this).closest(".modal").attr("id"))
  })

  // 点击背景关闭模态框
  $(".modal-backdrop").on("click", function () {
    closeModal($(this).closest(".modal").attr("id"))
  })

  // 文件上传
  $("#task-image-upload").on("change", handleFileSelect)

  // 阻止页面滚动导致的问题
  $("body").css("overflow", "hidden")

  // 壁纸设置
  $("#wallpaper-btn").on("click", () => {
    openModal("wallpaper-modal")
    loadWallpaperPreview()
  })

  // 壁纸表单提交
  $("#wallpaper-form").on("submit", handleWallpaperSubmit)

  // 移除壁纸
  $("#remove-wallpaper-btn").on("click", removeWallpaper)

  // 壁纸文件选择
  $("#wallpaper-upload").on("change", handleWallpaperSelect)
}

// 切换移动端导航
function toggleMobileNav() {
  $("#app-nav").toggleClass("active")
  $("#mobile-nav-overlay").toggleClass("active")
}

// 关闭移动端导航
function closeMobileNav() {
  $("#app-nav").removeClass("active")
  $("#mobile-nav-overlay").removeClass("active")
}

// 切换用户菜单
function toggleUserMenu() {
  $("#user-dropdown").toggleClass("active")
}

// 处理登录
function handleLogin(e) {
  e.preventDefault()

  const username = $("#login-username").val().trim()
  const password = $("#login-password").val().trim()

  if (!username || !password) {
    showToast("请填写完整的登录信息", "warning")
    return
  }

  const $btn = $(this).find('button[type="submit"]')
  $btn.addClass("loading").prop("disabled", true)

  $.ajax({
    url: `${API_BASE}/user/login`,
    method: "POST",
    data: { username, password },
    success: (response) => {
      console.log("登录响应:", response)
      if (response && (response.userId || response.user_id) && response !== false) {
        // 保存完整的用户信息，包括原始密码用于自动登录
        currentUser = {
          ...response,
          username: username,
          password: password,
        }
        localStorage.setItem("todoapp_user", JSON.stringify(currentUser))
        showToast("登录成功！", "success")
        setTimeout(() => {
          showMainApp()
        }, 500)
      } else {
        showToast("用户名或密码错误", "error")
        // 清除可能存在的无效本地存储
        localStorage.removeItem("todoapp_user")
        currentUser = null
      }
    },
    error: () => {
      showToast("登录失败，请检查网络连接", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 处理注册
function handleRegister(e) {
  e.preventDefault()

  const username = $("#register-username").val().trim()
  const email = $("#register-email").val().trim()
  const password = $("#register-password").val().trim()

  if (!username || !email || !password) {
    showToast("请填写完整的注册信息", "warning")
    return
  }

  const $btn = $(this).find('button[type="submit"]')
  $btn.addClass("loading").prop("disabled", true)

  $.ajax({
    url: `${API_BASE}/user/register`,
    method: "POST",
    data: { username, email, password },
    success: (response) => {
      if (response === "注册成功") {
        showToast("注册成功！请登录", "success")
        switchToLogin()
      } else {
        showToast(response || "注册失败", "error")
      }
    },
    error: () => {
      showToast("注册失败，请检查网络连接", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 切换到登录表单
function switchToLogin() {
  $("#register-form").removeClass("active")
  $("#login-form").addClass("active")
}

// 切换到注册表单
function switchToRegister() {
  $("#login-form").removeClass("active")
  $("#register-form").addClass("active")
}

// 切换主题
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", currentTheme)
  localStorage.setItem("todoapp_theme", currentTheme)
  updateThemeIcon()
}

// 处理登出
function handleLogout() {
  // 发送登出请求
  $.ajax({
    url: `${API_BASE}/user/logout`,
    method: "POST",
    success: () => {
      performLogout()
    },
    error: () => {
      // 即使服务器请求失败，也要执行本地登出
      performLogout()
    },
  })
}

// 执行登出操作
function performLogout() {
  console.log("执行登出操作")

  // 清除所有本地存储的用户相关信息
  localStorage.removeItem("todoapp_user")

  // 重置全局变量
  currentUser = null
  pendingTodos = []

  // 关闭所有下拉菜单
  $("#user-dropdown").removeClass("active")
  closeMobileNav()

  // 切换到登录页面
  showAuthPage()

  // 重置页面状态
  currentPage = "dashboard"
  $(".nav-item").removeClass("active")
  $(".nav-item[data-page='dashboard']").addClass("active")
  $(".content-section").removeClass("active")
  $("#dashboard").addClass("active")

  showToast("已成功登出", "success")

  // 清除壁纸
  removeWallpaperDisplay()
}

// 处理导航点击
function handleNavClick(e) {
  e.preventDefault()

  const page = $(this).data("page")
  if (page === currentPage) return

  // 关闭移动端导航
  closeMobileNav()

  // 更新导航状态
  $(".nav-item").removeClass("active")
  $(this).addClass("active")

  // 切换页面
  $(".content-section").removeClass("active")
  $(`#${page}`).addClass("active")

  currentPage = page

  // 加载对应页面数据
  loadPageData(page)
}

// 加载页面数据
function loadPageData(page) {
  switch (page) {
    case "dashboard":
      loadDashboardData()
      break
    case "overall-tasks":
      loadOverallTasks()
      break
    case "daily-summary":
      loadDailySummaries()
      break
    case "ai-assistant":
      loadAIData()
      break
  }
}

// 加载仪表盘数据
function loadDashboardData() {
  if (!currentUser) return

  loadStats()
  loadRecentTasks()
  loadTodayTodos()
}

// 加载统计数据
function loadStats() {
  // 加载总体任务数量
  $.ajax({
    url: `${API_BASE}/overall/selectByUserId`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        $("#total-tasks").text(response.length)
        const completed = response.filter((task) => task.isCompleted).length
        $("#completed-tasks").text(completed)
      }
    },
  })

  // 加载待办事项数量
  $.ajax({
    url: `${API_BASE}/todo/selectByUserId`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        const pending = response.filter((todo) => !todo.isCompleted).length
        $("#pending-todos").text(pending)

        // 获取今日待办数量
        loadTodayTodosCount()
      }
    },
  })
}

// 加载今日待办数量
function loadTodayTodosCount() {
  $.ajax({
    url: `${API_BASE}/day/selectLastDay`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (dayResponse) => {
      if (dayResponse && dayResponse.dayId) {
        $.ajax({
          url: `${API_BASE}/todo/selectByDayId`,
          method: "POST",
          data: { dayId: dayResponse.dayId,
            userIdn: currentUser.userId
           },
          success: (todosResponse) => {
            if (todosResponse && Array.isArray(todosResponse)) {
              const todayCount = todosResponse.filter((todo) => !todo.isCompleted).length
              $("#today-todos").text(todayCount)
            }
          },
        })
      } else {
        $("#today-todos").text(0)
      }
    },
  })
}

// 加载最近任务
function loadRecentTasks() {
  $.ajax({
    url: `${API_BASE}/overall/selectByUserId`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        const recentTasks = response.slice(-5).reverse()
        renderRecentTasks(recentTasks)
      }
    },
  })
}

// 渲染最近任务
function renderRecentTasks(tasks) {
  const $container = $("#recent-tasks-list")
  $container.empty()

  if (tasks.length === 0) {
    $container.html(
      '<div class="empty-state"><i class="fas fa-tasks"></i><h3>暂无任务</h3><p>开始创建您的第一个阶段任务吧</p></div>',
    )
    return
  }

  tasks.forEach((task) => {
    const $taskItem = $(`
      <div class="task-item" data-id="${task.overallId}" style="padding: 12px; border-bottom: 1px solid var(--divider-color); cursor: pointer; transition: background-color var(--transition-fast);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="flex: 1;">
            <h4 style="font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">${task.name}</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${task.description || "暂无描述"}</p>
          </div>
          <div class="task-status ${task.isCompleted ? "completed" : "pending"}" style="margin-left: 12px;">
            ${task.isCompleted ? "已完成" : "进行中"}
          </div>
        </div>
      </div>
    `)

    $taskItem.on("click", () => openTaskDetail(task.overallId))
    $taskItem.on("mouseenter", function () {
      $(this).css("background-color", "var(--bg-secondary)")
    })
    $taskItem.on("mouseleave", function () {
      $(this).css("background-color", "transparent")
    })
    $container.append($taskItem)
  })
}

// 加载今日待办
function loadTodayTodos() {
  $.ajax({
    url: `${API_BASE}/day/selectLastDay`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (dayResponse) => {
      if (dayResponse && dayResponse.dayId) {
        $.ajax({
          url: `${API_BASE}/todo/selectByDayId`,
          method: "POST",
          data: { dayId: dayResponse.dayId,
            userIdn: currentUser.userId
           },
          success: (todosResponse) => {
            if (todosResponse && Array.isArray(todosResponse)) {
              renderTodayTodos(todosResponse)
            }
          },
        })
      } else {
        $("#today-todos-list").html(
          '<div class="empty-state"><i class="fas fa-calendar-day"></i><h3>暂无今日待办</h3><p>AI将为您自动生成每日清单</p></div>',
        )
      }
    },
  })
}

// 渲染今日待办
function renderTodayTodos(todos) {
  const $container = $("#today-todos-list")
  $container.empty()

  if (todos.length === 0) {
    $container.html(
      '<div class="empty-state"><i class="fas fa-calendar-day"></i><h3>暂无今日待办</h3><p>AI将为您自动生成每日清单</p></div>',
    )
    return
  }

  todos.forEach((todo) => {
    const $todoItem = $(`
      <div class="todo-item ${todo.isCompleted ? "completed" : ""}" style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--divider-color); transition: background-color var(--transition-fast);">
        <label class="custom-checkbox">
          <input type="checkbox" ${todo.isCompleted ? "checked" : ""} 
                 onchange="toggleTodo(${todo.todoId}, this.checked)">
          <span class="checkbox-mark"></span>
        </label>
        <div class="todo-content" style="flex: 1;">
          <div class="todo-title" style="font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; ${todo.isCompleted ? "text-decoration: line-through; opacity: 0.6;" : ""}">${todo.title}</div>
          ${todo.description ? `<div class="todo-description" style="font-size: 12px; color: var(--text-secondary); margin-top: 2px; ${todo.isCompleted ? "opacity: 0.6;" : ""}">${todo.description}</div>` : ""}
        </div>
        <div class="todo-actions" style="display: flex; gap: 4px;">
          ${
            todo.isCompleted
              ? `<button class="btn-icon" onclick="deCompleteTodo(${todo.todoId})" title="标记未完成" style="width: 28px; height: 28px; font-size: 12px;">
              <i class="fas fa-undo"></i>
            </button>`
              : ""
          }
          <button class="btn-icon" onclick="deleteTodo(${todo.todoId})" title="删除" style="width: 28px; height: 28px; font-size: 12px;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `)

    $todoItem.on("mouseenter", function () {
      if (!todo.isCompleted) {
        $(this).css("background-color", "var(--today-bg)")
      }
    })
    $todoItem.on("mouseleave", function () {
      $(this).css("background-color", "transparent")
    })
    $container.append($todoItem)
  })
}

// 加载总体任务
function loadOverallTasks() {
  $.ajax({
    url: `${API_BASE}/overall/selectByUserId`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        renderOverallTasks(response)
      }
    },
  })
}

// 渲染总体任务
function renderOverallTasks(tasks) {
  const $container = $("#overall-tasks-grid")
  $container.empty()

  if (tasks.length === 0) {
    $container.html(`
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
        <i class="fas fa-tasks" style="font-size: 48px; color: var(--text-hint); margin-bottom: 16px;"></i>
        <h3 style="font-size: 18px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">暂无阶段任务</h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">创建您的第一个阶段任务，开始智能规划之旅</p>
        <button class="btn-primary" onclick="openModal('task-form-modal')" style="width: auto; padding: 12px 24px;">
          <i class="fas fa-plus" style="margin-right: 8px;"></i>
          <span>创建任务</span>
        </button>
      </div>
    `)
    return
  }

  // 按 createdAt 降序排序
  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  tasks.forEach((task) => {
    console.log("渲染任务:", task)
    const imageSrc = task.imgPath
      ? `http://anmory.com:96${task.imgPath}`
      : "./icon.png?height=200&width=300&text=任务图片"

    const $taskCard = $(`
      <div class="task-card" data-id="${task.overallId}">
        <div style="position: relative;">
          <img src="${imageSrc}" alt="${task.name}" class="task-image" 
               onerror="this.src='./icon.png?height=200&width=300&text=任务图片'">
          ${
            task.imgPath
              ? `<button class="download-btn" onclick="downloadImage('http://anmory.com:96${task.imgPath}', '${task.name}')" title="下载图片">
            <i class="fas fa-download"></i>
          </button>`
              : ""
          }
        </div>
        <div class="task-content">
          <div class="task-header">
            <h3 class="task-title">${task.name}</h3>
            <span class="task-status ${task.isCompleted ? "completed" : "pending"}">
              ${task.isCompleted ? "已完成" : "进行中"}
            </span>
          </div>
          <p class="task-description">${task.description || "暂无描述"}</p>
          <div class="task-actions">
            <button class="btn-icon" onclick="openTaskDetail(${task.overallId})" title="查看详情">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon success" onclick="toggleTaskComplete(${task.overallId}, ${!task.isCompleted})" title="${task.isCompleted ? "标记未完成" : "标记完成"}">
              <i class="fas ${task.isCompleted ? "fa-undo" : "fa-check"}"></i>
            </button>
            <button class="btn-icon" onclick="editTask(${task.overallId})" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteTask(${task.overallId})" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `)

    $container.append($taskCard)
  })
}

// 加载每日总结
function loadDailySummaries() {
  $.ajax({
    url: `${API_BASE}/day/selectByUserId`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        renderDailySummaries(response.reverse())
      }
    },
  })
}

// 渲染每日总结
function renderDailySummaries(summaries) {
  const $container = $("#summary-list")
  $container.empty()

  if (summaries.length === 0) {
    $container.html(`
      <div class="empty-state" style="text-align: center; padding: 48px;">
        <i class="fas fa-book-open" style="font-size: 48px; color: var(--text-hint); margin-bottom: 16px;"></i>
        <h3 style="font-size: 18px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">暂无每日总结</h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">开始记录您的每日感悟和收获</p>
        <button class="btn-primary" onclick="openModal('summary-form-modal')" style="width: auto; padding: 12px 24px;">
          <i class="fas fa-plus" style="margin-right: 8px;"></i>
          <span>写总结</span>
        </button>
      </div>
    `)
    return
  }

  summaries.forEach((summary) => {
    const $summaryCard = $(`
      <div class="summary-card" data-id="${summary.dayId}" style="background: var(--bg-surface); border-radius: var(--radius-large); padding: var(--spacing-lg); margin-bottom: var(--spacing-lg); box-shadow: var(--shadow-1); transition: box-shadow var(--transition-fast);">
        <div class="summary-header" style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--spacing-md);">
          <div style="flex: 1;">
            <h3 class="summary-title" style="font-size: 18px; font-weight: 500; color: var(--text-primary); margin-bottom: var(--spacing-xs);">${summary.title}</h3>
            <span class="summary-date" style="font-size: 12px; color: var(--text-secondary);">${formatDate(summary.createdAt)}</span>
          </div>
          <div class="summary-actions" style="display: flex; gap: var(--spacing-xs);">
            <button class="btn-icon" onclick="editSummary(${summary.dayId})" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteSummary(${summary.dayId})" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="summary-content" style="color: var(--text-secondary); line-height: 1.6;">${summary.overview || "暂无内容"}</div>
      </div>
    `)

    $summaryCard.on("mouseenter", function () {
      $(this).css("box-shadow", "var(--shadow-2)")
    })
    $summaryCard.on("mouseleave", function () {
      $(this).css("box-shadow", "var(--shadow-1)")
    })
    $container.append($summaryCard)
  })
}

// 加载AI数据
function loadAIData() {
  $.ajax({
    url: `${API_BASE}/ai/getAiOverviewsByUserId`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        renderAISummaries(response.reverse())
      } else {
        renderAISummaries([])
      }
    },
    error: () => {
      renderAISummaries([])
    },
  })
}

// 渲染AI总结
function renderAISummaries(summaries) {
  const $container = $("#ai-summaries-list")
  $container.empty()

  if (summaries.length === 0) {
    $container.html(`
      <div class="empty-state" style="text-align: center; padding: 48px;">
        <i class="fas fa-robot" style="font-size: 48px; color: var(--text-hint); margin-bottom: 16px;"></i>
        <h3 style="font-size: 18px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">暂无AI总结</h3>
        <p style="color: var(--text-secondary);">AI将根据您的任务进度生成智能总结</p>
      </div>
    `)
    return
  }

  // 按 createdAt 降序排序
  summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  summaries.forEach((summary) => {
    const $summaryCard = $(`
      <div class="summary-card" style="background: var(--bg-surface); border-radius: var(--radius-large); padding: var(--spacing-lg); margin-bottom: var(--spacing-lg); box-shadow: var(--shadow-1); border-left: 4px solid var(--primary-color);">
        <div class="summary-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-md);">
          <h3 class="summary-title" style="font-size: 16px; font-weight: 500; color: var(--text-primary);">${summary.title}</h3>
          <span class="summary-date" style="font-size: 12px; color: var(--text-secondary);">${formatDate(summary.createdAt)}</span>
        </div>
        <div class="summary-content" style="color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap;">${summary.overview}</div>
      </div>
    `)

    $container.append($summaryCard)
  })
}

// 打开任务详情
function openTaskDetail(taskId) {
  $.ajax({
    url: `${API_BASE}/overall/selectById`,
    method: "POST",
    data: { overallId: taskId },
    success: (task) => {
      if (task) {
        $("#task-detail-title").text(task.name)
        $("#task-description-text").text(task.description || "暂无描述")

        if (task.imgPath) {
          $("#task-image").attr("src", `http://anmory.com:96${task.imgPath}`).show()
          $(".task-image-container").show()
        } else {
          $(".task-image-container").hide()
        }

        loadTaskTodos(taskId)
        openModal("task-detail-modal")
      }
    },
  })
}

// 加载任务相关待办事项
function loadTaskTodos(taskId) {
  $.ajax({
    url: `${API_BASE}/todo/selectByOverallId`,
    method: "POST",
    data: { overallId: taskId },
    success: (response) => {
      if (response && Array.isArray(response)) {
        renderTaskTodos(response)
      }
    },
  })
}

// 渲染任务待办事项
function renderTaskTodos(todos) {
  const $container = $("#task-todos-list")
  $container.empty()

  if (todos.length === 0) {
    $container.html('<p style="color: var(--text-secondary); text-align: center; padding: 24px;">暂无相关待办事项</p>')
    return
  }

  todos.forEach((todo) => {
    const $todoItem = $(`
      <div class="todo-item ${todo.isCompleted ? "completed" : ""}" style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--divider-color);">
        <label class="custom-checkbox">
          <input type="checkbox" ${todo.isCompleted ? "checked" : ""} 
             onchange="toggleTodo(${todo.todoId}, this.checked)">
          <span class="checkbox-mark"></span>
        </label>
        <div class="todo-content" style="flex: 1;">
          <div class="todo-title" style="font-size: 14px; font-weight: 500; color: var(--text-primary); ${todo.isCompleted ? "text-decoration: line-through; opacity: 0.6;" : ""}">${todo.title}</div>
          ${todo.description ? `<div class="todo-description" style="font-size: 12px; color: var(--text-secondary); margin-top: 2px; ${todo.isCompleted ? "opacity: 0.6;" : ""}">${todo.description}</div>` : ""}
        </div>
        <div class="todo-actions" style="display: flex; gap: 4px;">
          ${
            todo.isCompleted
              ? `<button class="btn-icon" onclick="deCompleteTodo(${todo.todoId})" title="标记未完成" style="width: 28px; height: 28px; font-size: 12px;">
          <i class="fas fa-undo"></i>
        </button>`
              : ""
          }
        </div>
      </div>
    `)

    $container.append($todoItem)
  })
}

// 处理任务表单提交
function handleTaskSubmit(e) {
  e.preventDefault()

  const name = $("#task-name").val().trim()
  const description = $("#task-desc").val().trim()
  const fileInput = $("#task-image-upload")[0]
  const file = fileInput.files[0]

  if (!name) {
    showToast("请输入任务名称", "warning")
    return
  }

  const $btn = $(this).find('button[type="submit"]')
  $btn.addClass("loading").prop("disabled", true)

  // 使用FormData正确处理文件上传
  const formData = new FormData()
  formData.append("userIdn", currentUser.userId)
  formData.append("name", name)
  formData.append("description", description || "")

  if (file) {
    formData.append("file", file)
  }

  $.ajax({
    url: `${API_BASE}/overall/insert`,
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: (response) => {
      console.log("任务创建响应:", response)
      if (response > 0) {
        showToast("任务添加成功！", "success")
        closeModal("task-form-modal")
        $("#task-form")[0].reset()
        $(".file-upload-area").html(`
          <i class="fas fa-cloud-upload-alt"></i>
          <p>点击选择图片或拖拽到此处</p>
          <small>支持 JPG、PNG、GIF 格式</small>
        `)
        loadOverallTasks()
        loadDashboardData()
      } else {
        showToast("任务添加失败", "error")
      }
    },
    error: (xhr, status, error) => {
      console.error("任务创建错误:", xhr, status, error)
      showToast("网络错误，请重试", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 处理总结表单提交
function handleSummarySubmit(e) {
  e.preventDefault()

  const title = $("#summary-title").val().trim()
  const content = $("#summary-content").val().trim()

  if (!title || !content) {
    showToast("请填写完整的总结信息", "warning")
    return
  }

  const $btn = $(this).find('button[type="submit"]')
  $btn.addClass("loading").prop("disabled", true)

  $.ajax({
    url: `${API_BASE}/day/insert`,
    method: "POST",
    data: {
      userIdn: currentUser.userId,
      title: title,
      overview: content,
    },
    success: (response) => {
      if (response > 0) {
        showToast("总结保存成功！", "success")
        closeModal("summary-form-modal")
        $("#summary-form")[0].reset()
        loadDailySummaries()
      } else {
        showToast("总结保存失败", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 切换待办事项完成状态
function toggleTodo(todoId, isCompleted) {
  if (isCompleted) {
    $.ajax({
      url: `${API_BASE}/todo/complete`,
      method: "POST",
      data: { todoId: todoId },
      success: (response) => {
        if (response > 0) {
          showToast("待办事项已完成！", "success")
          loadDashboardData()
          loadTodayTodos()
        } else {
          showToast("操作失败", "error")
        }
      },
    })
  }
}

// 取消完成待办事项
function deCompleteTodo(todoId) {
  $.ajax({
    url: `${API_BASE}/todo/deCompleted`,
    method: "POST",
    data: { todoId: todoId },
    success: (response) => {
      if (response > 0) {
        showToast("待办事项已标记为未完成", "success")
        loadDashboardData()
        loadTodayTodos()
      } else {
        showToast("操作失败", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
  })
}

// 删除待办事项
function deleteTodo(todoId) {
  if (!confirm("确定要删除这个待办事项吗？")) return

  $.ajax({
    url: `${API_BASE}/todo/delete`,
    method: "POST",
    data: { todoId: todoId },
    success: (response) => {
      if (response > 0) {
        showToast("待办事项已删除", "success")
        loadDashboardData()
        loadTodayTodos()
      } else {
        showToast("删除失败", "error")
      }
    },
  })
}

// 切换任务完成状态
function toggleTaskComplete(taskId, isCompleted) {
  const endpoint = isCompleted ? "/overall/complete" : "/overall/deCompleted"

  $.ajax({
    url: `${API_BASE}${endpoint}`,
    method: "POST",
    data: { overallId: taskId },
    success: (response) => {
      if (response > 0) {
        showToast(isCompleted ? "任务已完成！" : "任务已标记为未完成", "success")
        loadOverallTasks()
        loadDashboardData()
      } else {
        showToast("操作失败", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
  })
}

// 删除任务
function deleteTask(taskId) {
  if (!confirm("确定要删除这个任务吗？删除后将无法恢复！")) return

  $.ajax({
    url: `${API_BASE}/overall/delete`,
    method: "POST",
    data: { overallId: taskId },
    success: (response) => {
      if (response > 0) {
        showToast("任务已删除", "success")
        loadOverallTasks()
        loadDashboardData()
      } else {
        showToast("删除失败", "error")
      }
    },
  })
}

// 删除总结
function deleteSummary(dayId) {
  if (!confirm("确定要删除这个总结吗？")) return

  $.ajax({
    url: `${API_BASE}/day/delete`,
    method: "POST",
    data: { dayId: dayId },
    success: (response) => {
      if (response > 0) {
        showToast("总结已删除", "success")
        loadDailySummaries()
      } else {
        showToast("删除失败", "error")
      }
    },
  })
}

// 生成AI待办事项
function generateTodos() {
  const $btn = $("#generate-todos-btn")
  $btn.addClass("loading").prop("disabled", true)

  $.ajax({
    url: `${API_BASE}/ai/generateDailyGoals`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response === true) {
        showToast("AI已为您生成待办事项，请审核确认", "success")
        // 加载待审核的待办事项
        loadPendingTodos()
      } else {
        showToast("生成失败，请稍后重试", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 加载待审核的待办事项
function loadPendingTodos() {
  $.ajax({
    url: `${API_BASE}/day/selectLastDay`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (dayResponse) => {
      if (dayResponse && dayResponse.dayId) {
        $.ajax({
          url: `${API_BASE}/todo/selectByDayId`,
          method: "POST",
          data: { dayId: dayResponse.dayId,
            userIdn: currentUser.userId
           },
          success: (todosResponse) => {
            if (todosResponse && Array.isArray(todosResponse)) {
              console.log("待审核的待办事项:", todosResponse)
              pendingTodos = todosResponse
              renderPendingTodos()
              $("#ai-review-section").show()
            }
          },
        })
      }
    },
  })
}

// 渲染待审核的待办事项
function renderPendingTodos() {
  const $container = $("#ai-todos-review")
  $container.empty()
  console.log("渲染待审核的待办事项:", pendingTodos)

  if (pendingTodos.length === 0) {
    $("#ai-review-section").hide()
    return
  }

  pendingTodos.forEach((todo, index) => {
    const $todoItem = $(`
      <div class="review-todo-item" data-index="${index}">
        <div class="review-todo-header">
          <span style="font-size: 12px; color: var(--text-secondary);">待办 ${index + 1}</span>
          <div class="review-todo-actions">
            <button class="btn-icon" onclick="editReviewTodo(${index})" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteReviewTodo(${index})" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <input type="text" class="review-todo-title" value="${todo.title}" placeholder="待办标题" readonly>
        <textarea class="review-todo-description" placeholder="待办描述（可选）" readonly>${todo.description || ""}</textarea>
      </div>
    `)

    $container.append($todoItem)
  })
}

// 编辑审核待办
function editReviewTodo(index) {
  const $item = $(`.review-todo-item[data-index="${index}"]`)
  const $title = $item.find(".review-todo-title")
  const $desc = $item.find(".review-todo-description")

  if ($title.prop("readonly")) {
    // 进入编辑模式
    $title.prop("readonly", false).focus()
    $desc.prop("readonly", false)
    $item.addClass("editing")

    // 更改按钮为保存
    $item.find(".review-todo-actions").html(`
      <button class="btn-icon success" onclick="saveReviewTodo(${index})" title="保存">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn-icon" onclick="cancelEditReviewTodo(${index})" title="取消">
        <i class="fas fa-times"></i>
      </button>
    `)
  }
}

// 保存审核待办
function saveReviewTodo(index) {
  const $item = $(`.review-todo-item[data-index="${index}"]`)
  const $title = $item.find(".review-todo-title")
  const $desc = $item.find(".review-todo-description")
  $.ajax({
    url: `${API_BASE}/todo/update`,
    method: "POST",
    data: {
      todoId: pendingTodos[index].todoId,
      title: $title.val().trim(),
      description: $desc.val().trim(),
    },
    success: (response) => {
      if (response > 0) {
        showToast("待办事项已更新", "success")
      } else {
        showToast("更新失败", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
  });

  const newTitle = $title.val().trim()
  if (!newTitle) {
    showToast("待办标题不能为空", "warning")
    return
  }

  // 更新数据
  pendingTodos[index].title = newTitle
  pendingTodos[index].description = $desc.val().trim()

  // 退出编辑模式
  $title.prop("readonly", true)
  $desc.prop("readonly", true)
  $item.removeClass("editing")

  // 恢复按钮
  $item.find(".review-todo-actions").html(`
    <button class="btn-icon" onclick="editReviewTodo(${index})" title="编辑">
      <i class="fas fa-edit"></i>
    </button>
    <button class="btn-icon danger" onclick="deleteReviewTodo(${index})" title="删除">
      <i class="fas fa-trash"></i>
    </button>
  `)

  // showToast("待办已更新", "success")
}

// 取消编辑审核待办
function cancelEditReviewTodo(index) {
  const $item = $(`.review-todo-item[data-index="${index}"]`)
  const $title = $item.find(".review-todo-title")
  const $desc = $item.find(".review-todo-description")

  // 恢复原值
  $title.val(pendingTodos[index].title).prop("readonly", true)
  $desc.val(pendingTodos[index].description || "").prop("readonly", true)
  $item.removeClass("editing")

  // 恢复按钮
  $item.find(".review-todo-actions").html(`
    <button class="btn-icon" onclick="editReviewTodo(${index})" title="编辑">
      <i class="fas fa-edit"></i>
    </button>
    <button class="btn-icon danger" onclick="deleteReviewTodo(${index})" title="删除">
      <i class="fas fa-trash"></i>
    </button>
  `)
}

// 删除审核待办
function deleteReviewTodo(index) {
  console.log("删除待办事项，索引:", index)
  console.log("删除待办事项，索引:", pendingTodos[index])
  if (!confirm("确定要删除这个待办事项吗？")) return

  // pendingTodos.splice(index, 1)
  $.ajax({
    url: `${API_BASE}/todo/delete`,
    method: "POST",
    data: { todoId: pendingTodos[index].todoId },
    success: (response) => {
      if (response > 0) {
        pendingTodos.splice(index, 1) // 从数组中删除
        console.log("待办事项:", pendingTodos)
        showToast("待办事项已删除", "success")
      } else {
        showToast("删除失败", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
  });
  renderPendingTodos()

  if (pendingTodos.length === 0) {
    $("#ai-review-section").hide()
  }

  // showToast("待办已删除", "success")
}

// 重新生成待办
function regenerateTodos() {
  if (!confirm("确定要重新生成待办事项吗？这将替换当前的待办列表。")) return

  generateTodos()
}

// 确认应用待办
function confirmTodos() {
  if (pendingTodos.length === 0) {
    showToast("没有待办事项需要确认", "warning")
    return
  }

  const $btn = $("#confirm-todos-btn")
  $btn.addClass("loading").prop("disabled", true)

  // 批量更新待办事项
  let updateCount = 0
  const totalCount = pendingTodos.length

  pendingTodos.forEach((todo) => {
    $.ajax({
      url: `${API_BASE}/todo/update`,
      method: "POST",
      data: {
        todoId: todo.todoId,
        title: todo.title,
        description: todo.description || "",
      },
      success: (response) => {
        updateCount++
        if (updateCount === totalCount) {
          // 所有更新完成
          showToast("待办事项已确认应用！", "success")
          $("#ai-review-section").hide()
          pendingTodos = []
          loadDashboardData()
          loadTodayTodos()
        }
      },
      error: () => {
        updateCount++
        if (updateCount === totalCount) {
          showToast("部分待办事项更新失败", "warning")
          $("#ai-review-section").hide()
          pendingTodos = []
          loadDashboardData()
          loadTodayTodos()
        }
      },
      complete: () => {
        if (updateCount === totalCount) {
          $btn.removeClass("loading").prop("disabled", false)
        }
      },
    })
  })
}

// 生成AI总结
function generateSummary() {
  const $btn = $("#generate-summary-btn")
  $btn.addClass("loading").prop("disabled", true)

  $.ajax({
    url: `${API_BASE}/ai/aiSummary`,
    method: "POST",
    data: { userIdn: currentUser.userId },
    success: (response) => {
      if (response === true) {
        showToast("AI总结已生成！", "success")
        loadAIData()
      } else {
        showToast("生成失败，请稍后重试", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 每隔5天自动生成Ai总结
function scheduleAISummary() {
  const now = new Date()
  const nextSummaryDate = new Date(now)
  nextSummaryDate.setDate(nextSummaryDate.getDate() + (5 - (now.getDate() % 5)))

  const timeUntilNextSummary = nextSummaryDate.getTime() - now.getTime()

  setTimeout(() => {
    generateSummary()
    setInterval(generateSummary, 5 * 24 * 60 * 60 * 1000)
  }, timeUntilNextSummary)
}

// 下载图片
function downloadImage(url, filename) {
  const link = document.createElement("a")
  link.href = url
  link.download = filename || "image"
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 处理文件选择
function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    const $uploadArea = $(".file-upload-area")
    $uploadArea.html(`
      <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
      <p>已选择: ${file.name}</p>
      <small>点击可重新选择</small>
    `)
  }
}

// 编辑任务（占位函数）
// 编辑任务
function editTask(taskId) {
  $.ajax({
    url: `${API_BASE}/overall/selectById`,
    method: "POST",
    data: { overallId: taskId },
    success: function (response) {
      if (response) {
        // 打开任务模态框
        openModal("task-form-modal");
        $("#task-form-title").text("编辑任务");

        // 填充表单数据
        $("#task-name").val(response.name || "");
        $("#task-desc").val(response.description || "");
        const fileUploadArea = $("#task-image-upload").parent().find(".file-upload-area");

        // 显示当前图片（如果有）
        if (response.imgPath) {
          fileUploadArea.html(`
            <img src="http://anmory.com:95${response.imgPath}" alt="任务图片" style="max-width: 100%; max-height: 100px;">
            <p>点击选择新图片或拖拽替换</p>
            <small>支持 JPG、PNG、GIF 格式</small>
          `);
        } else {
          fileUploadArea.html(`
            <i class="fas fa-cloud-upload-alt"></i>
            <p>点击选择图片或拖拽到此处</p>
            <small>支持 JPG、PNG、GIF 格式</small>
          `);
        }

        // 更新表单提交逻辑
        $("#task-form").off("submit").on("submit", function (e) {
          e.preventDefault();
          const formData = new FormData();
          formData.append("overallId", taskId);
          formData.append("name", $("#task-name").val().trim());
          formData.append("description", $("#task-desc").val().trim());
          const fileInput = $("#task-image-upload")[0];
          if (fileInput.files.length > 0) {
            formData.append("file", fileInput.files[0]);
          }
          formData.append("isCompleted", response.isCompleted || false);

          const $btn = $(this).find('button[type="submit"]');
          $btn.addClass("loading").prop("disabled", true);

          $.ajax({
            url: `${API_BASE}/overall/update`,
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
              if (result === 1) {
                showToast("任务更新成功", "success");
                closeModal("task-form-modal");
                $("#task-form")[0].reset();
                fileUploadArea.html(`
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>点击选择图片或拖拽到此处</p>
                  <small>支持 JPG、PNG、GIF 格式</small>
                `);
                loadOverallTasks();
                loadDashboardData();
              } else {
                showToast("任务更新失败", "error");
              }
            },
            error: function (xhr) {
              showToast("任务更新失败：" + xhr.responseText, "error");
            },
            complete: function () {
              $btn.removeClass("loading").prop("disabled", false);
            }
          });
        });
      } else {
        showToast("无法加载任务数据", "error");
      }
    },
    error: function (xhr) {
      showToast("获取任务数据失败：" + xhr.responseText, "error");
    }
  });
}

// 编辑总结
function editSummary(dayId) {
  $.ajax({
    url: `${API_BASE}/day/selectById`,
    method: "POST",
    data: { dayId: dayId },
    success: function (response) {
      if (response && response.dayId) {
        // 打开总结模态框
        openModal("summary-form-modal");
        $("#summary-form-title").text("编辑总结");

        // 填充表单数据
        $("#summary-title").val(response.title || "");
        $("#summary-content").val(response.overview || "");

        // 更新表单提交逻辑
        $("#summary-form").off("submit").on("submit", function (e) {
          e.preventDefault();
          const title = $("#summary-title").val().trim();
          const overview = $("#summary-content").val().trim();

          if (!title || !overview) {
            showToast("请填写完整的总结信息", "warning");
            return;
          }

          const $btn = $(this).find('button[type="submit"]');
          $btn.addClass("loading").prop("disabled", true);

          $.ajax({
            url: `${API_BASE}/day/update`,
            method: "POST",
            data: { dayId: dayId, title: title, overview: overview },
            success: function (result) {
              if (result === 1) {
                showToast("总结更新成功", "success");
                closeModal("summary-form-modal");
                $("#summary-form")[0].reset();
                loadDailySummaries();
                loadDashboardData();
              } else {
                showToast("总结更新失败", "error");
              }
            },
            error: function (xhr) {
              showToast("总结更新失败：" + xhr.responseText, "error");
            },
            complete: function () {
              $btn.removeClass("loading").prop("disabled", false);
            }
          });
        });
      } else {
        showToast("无法加载总结数据", "error");
      }
    },
    error: function (xhr) {
      showToast("获取总结数据失败：" + xhr.responseText, "error");
    }
  });
}

// 打开模态框
function openModal(modalId) {
  $(`#${modalId}`).addClass("active")
  $("body").css("overflow", "hidden")
}

// 关闭模态框
function closeModal(modalId) {
  $(`#${modalId}`).removeClass("active")
  $("body").css("overflow", "hidden") // 保持hidden状态
}

// 显示Toast通知
function showToast(message, type = "info", title = "") {
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }

  const titles = {
    success: "成功",
    error: "错误",
    warning: "警告",
    info: "提示",
  }

  const $toast = $(`
    <div class="toast ${type}">
      <i class="fas ${icons[type]}"></i>
      <div class="toast-content">
        <div class="toast-title">${title || titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
    </div>
  `)

  $("#toast-container").append($toast)

  // 自动移除
  setTimeout(() => {
    $toast.fadeOut(300, function () {
      $(this).remove()
    })
  }, 3000)
}

// 更新当前日期
function updateCurrentDate() {
  const now = new Date()
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }
  const dateString = now.toLocaleDateString("zh-CN", options)
  $("#current-date").text(dateString)
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// 定时任务 - 每天0点生成待办事项
function scheduleAITasks() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const timeUntilMidnight = tomorrow.getTime() - now.getTime()

  setTimeout(() => {
    generateTodos()
    // 设置每24小时执行一次
    setInterval(generateTodos, 24 * 60 * 60 * 1000)
  }, timeUntilMidnight)
}

// 启动定时任务
if (currentUser) {
  scheduleAITasks()
  scheduleAISummary()
}

// 显示登录页面
function showAuthPage() {
  console.log("显示登录页面")
  $("#main-app").removeClass("active").hide() // 隐藏主应用页面
  $("#auth-page").addClass("active").show() // 显示登录页面

  // 清空表单
  $("#login-form form")[0].reset()
  $("#register-form form")[0].reset()

  // 确保显示登录表单
  $("#register-form").removeClass("active")
  $("#login-form").addClass("active")
}

// 加载用户壁纸
function loadUserWallpaper() {
  console.log("加载用户壁纸", currentUser)
  if (currentUser && currentUser.wallPaperPath) {
    const wallpaperUrl = `http://anmory.com:96${currentUser.wallPaperPath}`
    console.log("用户壁纸URL:", wallpaperUrl)
    setWallpaper(wallpaperUrl)
    currentWallpaper = currentUser.wallPaperPath
  } else {
    console.log("用户没有设置壁纸")
    removeWallpaperDisplay()
  }
}

// 设置壁纸显示
function setWallpaper(imageUrl) {
  console.log("开始设置壁纸:", imageUrl);

  // 创建背景元素（如果不存在）
  if (!document.getElementById("app-background")) {
    const bgElement = document.createElement("div");
    bgElement.id = "app-background";
    bgElement.className = "app-background";
    document.body.insertBefore(bgElement, document.body.firstChild);
  }

  if (!document.getElementById("app-overlay")) {
    const overlayElement = document.createElement("div");
    overlayElement.id = "app-overlay";
    overlayElement.className = "app-overlay";
    document.body.insertBefore(overlayElement, document.body.firstChild);
  }

  // 设置壁纸背景
  const bgElement = document.getElementById("app-background");
  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    bgElement.style.backgroundImage = `url("${imageUrl}")`;
    bgElement.style.backgroundSize = "cover";
    bgElement.style.backgroundPosition = "center";
    bgElement.style.backgroundRepeat = "no-repeat";
    bgElement.style.backgroundAttachment = "fixed";
    document.body.classList.add("has-wallpaper");
    console.log("壁纸已成功设置:", imageUrl);
    console.log("背景元素样式:", bgElement.style.backgroundImage);
  };

  img.onerror = () => {
    console.error("壁纸图片加载失败:", imageUrl);
    bgElement.style.backgroundImage = "none";
    bgElement.style.backgroundColor = "var(--bg-primary)";
    document.body.classList.remove("has-wallpaper");
    showToast("壁纸加载失败，请选择其他图片", "error");
  };
}

// 移除壁纸显示
function removeWallpaperDisplay() {
  const bgElement = document.getElementById("app-background")
  if (bgElement) {
    bgElement.style.backgroundImage = "none"
  }

  document.body.classList.remove("has-wallpaper")
  currentWallpaper = null
  console.log("壁纸已移除")
}

// 加载壁纸预览
function loadWallpaperPreview() {
  if (currentWallpaper) {
    const wallpaperUrl = `http://anmory.com:96${currentWallpaper}`
    $("#wallpaper-preview").css("background-image", `url(${wallpaperUrl})`)
  } else {
    $("#wallpaper-preview").css("background-image", "none")
  }
}

// 处理壁纸文件选择
function handleWallpaperSelect(e) {
  const file = e.target.files[0]
  if (file) {
    // 显示文件选择状态
    const $uploadArea = $("#wallpaper-modal .file-upload-area")
    $uploadArea.html(`
      <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
      <p>已选择: ${file.name}</p>
      <small>点击"应用壁纸"来上传并设置</small>
    `)

    // 预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
      $("#wallpaper-preview").css("background-image", `url(${e.target.result})`)
    }
    reader.readAsDataURL(file)
  }
}

// 处理壁纸表单提交
function handleWallpaperSubmit(e) {
  e.preventDefault()

  const fileInput = $("#wallpaper-upload")[0]
  const file = fileInput.files[0]

  if (!file) {
    showToast("请选择壁纸图片", "warning")
    return
  }

  const $btn = $(this).find('button[type="submit"]')
  $btn.addClass("loading").prop("disabled", true)

  // 使用FormData上传文件
  const formData = new FormData()
  formData.append("userIdn", currentUser.userId)
  formData.append("file", file)

  $.ajax({
    url: `${API_BASE}/user/uploadSelfWallPaper`,
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: (response) => {
      console.log("壁纸上传响应:", response)
      if (response > 0) {
        showToast("壁纸设置成功！", "success")

        // 更新当前用户信息 - 修改这里的路径构建逻辑
        const fileName = file.name
        const wallpaperPath = `/usr/local/nginx/images/todoPro/${fileName}`
        currentUser.wallPaperPath = wallpaperPath
        localStorage.setItem("todoapp_user", JSON.stringify(currentUser))

        // 立即应用壁纸 - 使用完整URL
        const wallpaperUrl = `http://anmory.com:96${wallpaperPath}`
        setWallpaper(wallpaperUrl)
        currentWallpaper = wallpaperPath

        // 强制刷新页面样式
        setTimeout(() => {
          const bgElement = document.getElementById("app-background")
          if (bgElement && bgElement.style.backgroundImage === "none") {
            console.log("重新设置壁纸")
            setWallpaper(wallpaperUrl)
          }
        }, 100)

        closeModal("wallpaper-modal")

        // 重置表单
        $("#wallpaper-form")[0].reset()
        $("#wallpaper-modal .file-upload-area").html(`
          <i class="fas fa-image"></i>
          <p>点击选择壁纸图片或拖拽到此处</p>
          <small>支持 JPG、PNG、GIF 格式，建议尺寸 1920x1080</small>
        `)
      } else {
        showToast("壁纸上传失败", "error")
      }
    },
    error: (xhr, status, error) => {
      console.error("壁纸上传错误:", xhr, status, error)
      showToast("网络错误，请重试", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 移除壁纸
function removeWallpaper() {
  if (!confirm("确定要移除当前壁纸吗？")) return

  const $btn = $("#remove-wallpaper-btn")
  $btn.addClass("loading").prop("disabled", true)

  $.ajax({
    url: `${API_BASE}/user/uploadSelfWallPaper`,
    method: "POST",
    data: {
      userIdn: currentUser.userId,
      // 不传file参数，后端会将wallPaperPath设为null
    },
    success: (response) => {
      if (response > 0) {
        showToast("壁纸已移除", "success")

        // 更新当前用户信息
        currentUser.wallPaperPath = null
        localStorage.setItem("todoapp_user", JSON.stringify(currentUser))

        // 移除壁纸显示
        removeWallpaperDisplay()

        // 更新预览
        $("#wallpaper-preview").css("background-image", "none")

        closeModal("wallpaper-modal")
      } else {
        showToast("移除壁纸失败", "error")
      }
    },
    error: () => {
      showToast("网络错误，请重试", "error")
    },
    complete: () => {
      $btn.removeClass("loading").prop("disabled", false)
    },
  })
}

// 调试函数 - 检查壁纸状态
function debugWallpaper() {
  console.log("=== 壁纸调试信息 ===")
  console.log("当前用户:", currentUser)
  console.log("当前壁纸路径:", currentWallpaper)
  console.log("Body类名:", document.body.className)

  const bgElement = document.getElementById("app-background")
  const overlayElement = document.getElementById("app-overlay")

  console.log("背景元素存在:", !!bgElement)
  console.log("覆盖层元素存在:", !!overlayElement)

  if (bgElement) {
    console.log("背景图片:", bgElement.style.backgroundImage)
    console.log("背景元素样式:", {
      backgroundSize: bgElement.style.backgroundSize,
      backgroundPosition: bgElement.style.backgroundPosition,
      backgroundRepeat: bgElement.style.backgroundRepeat,
      backgroundAttachment: bgElement.style.backgroundAttachment,
    })
  }

  console.log("==================")
}

// 在控制台可以调用 debugWallpaper() 来查看状态
window.debugWallpaper = debugWallpaper
