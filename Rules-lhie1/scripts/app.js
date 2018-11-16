const proxyUtil = require('scripts/proxyUitl')
const updateUtil = require('scripts/updateUtil')
const cu = require('scripts/colorUtil')
const ruleUpdateUtil = require('scripts/ruleUpdateUtil')
const colorUtil = require('scripts/colorUtil')

const FILE = 'data.js'
const PROXY_HEADER = 'ProxyHeader'

const settingKeys = ['widgetSettings', 'generalSettings', 'proxyGroupSettings', 'customSettings', 'hostSettings', 'urlrewriteSettings', 'ssidSettings', 'headerrewriteSettings', 'hostnameSettings', 'mitmSettings']

if (!$file.exists(FILE)) {
  $file.write({
    data: $data({ "string": JSON.stringify({ "urls": [] }) }),
    path: FILE
  })
}

String.prototype.reverse = function () {
  return this.toString().split('').reverse().join('')
}

String.prototype.contains = function (sub) {
  return this.indexOf(sub) > -1
}

setDefaultSettings()

let screenHeight = $device.info.screen.height
const screenWidth = $device.info.screen.width

const iPhoneX = $device.isIphoneX
if (iPhoneX) {
  screenHeight -= 48
}

const statusBarHeight = iPhoneX ? 44 : 20
const navBarHeight = 45

const selectedColor = $color("#c1dcf0")
const btnOnFg = colorUtil.getColor("usualBtnOnFg")
const btnOnBg = colorUtil.getColor("usualBtnOnBg")
const btnOffFg = colorUtil.getColor("usualBtnOffFg")
const btnOffBg = colorUtil.getColor("usualBtnOffBg")

function renderUI() {
  $ui.render({
    props: {
      title: "lhie1规则",
      navBarHidden: true,
      statusBarHidden: colorUtil.getColor("statusBar", true) === 'clear' ? true : false,
      statusBarStyle: colorUtil.getColor("statusBar", true) === '#ffffff' ? 1 : 0,
      id: "bodyView",
    },
    events: {
      appeared: function (sender) {
        // $("bodyView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$delegate()
        // $("bodyView").runtimeValue().$viewController().$navigationController().$interactivePopGestureRecognizer().$setDelegate(null)
        if (typeof $ui.window.next !== 'undefined') {
          console.error('警告：正在调试模式运行，界面可能会被遮挡，请从JSBox主界面运行此脚本！')
          $addin.restart()
        }
      }
    },
    views: [{
      type: "view",
      props: {
        id: "navBar",
        bgcolor: colorUtil.getColor("navBar")
      },
      layout: (make, view) => {
        make.height.equalTo(navBarHeight + statusBarHeight)
        make.width.equalTo(view.super)
      },
      views: [{
        type: "lottie",
        props: {
          id: "navLoadingIcon",
          loop: false,
          speed: 3,
          src: "assets/balloons.json"
        },
        layout: (make, view) => {
          make.size.equalTo($size(screenWidth, screenHeight))
          make.bottom.equalTo(navBarHeight + statusBarHeight + 80)
          // make.right.equalTo(view.prev.left).offset(-15)
          // make.bottom.equalTo(view.super).offset(100)
        }
      }, {
        type: "label",
        props: {
          text: "lhie1规则",
          textColor: colorUtil.getColor("navTitleText"),
          font: $font("bold", 25)
        },
        layout: (make, view) => {
          make.height.equalTo(navBarHeight)
          make.top.equalTo(statusBarHeight)
          make.left.equalTo(15)
        }
      }, {
        type: "image",
        props: {
          icon: $icon("204", colorUtil.getColor("navIconRight"), $size(25, 25)),
          bgcolor: $color("clear")
        },
        layout: (make, view) => {
          make.right.equalTo(view.super).offset(-15)
          make.height.width.equalTo(25)
          make.bottom.equalTo(view.super).offset(-10)
        },
        events: {
          tapped: sender => {
            archivesHandler()
          }
        }
      }, {
        type: "image",
        props: {
          icon: $icon("074", colorUtil.getColor("navIconLeft"), $size(25, 25)),
          bgcolor: $color("clear")
        },
        layout: (make, view) => {
          make.right.equalTo(view.prev.left).offset(-15)
          make.height.width.equalTo(25)
          make.bottom.equalTo(view.super).offset(-10)
        },
        events: {
          tapped: sender => {
            // $clipboard.text = 'GxsAtS84U7'
            // $app.openURL("alipay://")
            // $app.openURL("https://qr.alipay.com/c1x047207ryk0wiaj6m6ye3")
            $ui.alert({
              title: '感谢支持',
              message: '作者投入大量时间和精力对脚本进行开发和完善，你愿意给他赏杯咖啡支持一下吗？',
              actions: [{
                title: "支付宝",
                handler: () => {
                  $app.openURL($qrcode.decode($file.read("assets/thankyou2.jpg").image))
                }
              }, {
                title: "微信",
                handler: () => {
                  $quicklook.open({
                    image: $file.read("assets/thankyou.jpg").image
                  })
                }
              }, {
                title: "返回"
              }]
            })
          }
        }
      },]
    }, {
      type: "view",
      props: {
        id: "mainView"
      },
      layout: (make, view) => {
        make.height.equalTo(view.super).offset(navBarHeight + statusBarHeight);
        make.width.equalTo(view.super)
        make.top.equalTo(navBarHeight + statusBarHeight)
      },
      views: [{
        type: "input",
        props: {
          id: "fileName",
          text: '',
          placeholder: "配置名（lhie1)"
        },
        layout: (make, view) => {
          make.width.equalTo(view.super).offset(-120)
          make.height.equalTo(40)
          make.left.top.equalTo(10)
        },
        events: {
          changed: sender => {
            saveWorkspace()
          },
          returned: sender => {
            sender.blur()
          }
        }
      }, {
        type: "button",
        props: {
          type: $btnType.contactAdd,
          id: "serverURL",
          titleColor: colorUtil.getColor("importBtnText"),
          title: " 导入节点",
        },
        layout: (make, view) => {
          make.width.equalTo(100)
          make.height.equalTo(40)
          make.right.equalTo(-10)
          make.top.equalTo(10)
        },
        events: {
          tapped: sender => {
            importMenu({
              handler: nodeImportHandler
            })
          }
        }
      }, {
        type: "matrix",
        props: {
          id: "serverControl",
          columns: 4,
          scrollEnabled: false,
          itemHeight: 40,
          bgcolor: $color("#f0f5f5"),
          data: genControlItems(),
          template: [{
            type: "label",
            props: {
              id: "title",
              align: $align.center,
              font: $font(14),
              textColor: colorUtil.getColor("controlBtnText"),
              autoFontSize: true
            },
            layout: $layout.fill
          }],
          info: {}
        },
        layout: (make, view) => {
          make.width.equalTo(view.super).offset(-20)
          make.centerX.equalTo(view.super)
          make.height.equalTo(40)
          make.top.equalTo($("serverURL").bottom).offset(10)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            let btnTitle = data.title.text
            if (btnTitle === '节点倒序') {
              reverseServerGroup()
            } else if (btnTitle === '删除分组') {
              deleteServerGroup()
            } else if (btnTitle === '特殊代理') {
              specialProxyGroup();
            } else {
              groupShortcut()
            }
          }
        }
      }, {
        type: "list",
        props: {
          id: "serverEditor",
          data: [],
          separatorHidden: true,
          reorder: true,
          actions: [{
            title: "delete",
            handler: (sender, indexPath) => {
              saveWorkspace()
            }
          }, {
            title: "编辑",
            color: $color("tint"),
            handler: (sender, indexPath) => {
              let od = sender.data
              let section = od[indexPath.section]
              let item = section.rows[indexPath.row]
              showAlterDialog(section.title, item.proxyLink, (newSec, newLink) => {
                item.proxyLink = newLink
                item.proxyName.text = newLink.split(/\s*=/)[0]
                section.rows[indexPath.row] = item
                section.title = newSec
                sender.data = formatListData(od)
                saveWorkspace()
              })
            }
          }, {
            title: "特殊代理",
            handler: (sender, indexPath) => {
              let proxyName = sender.object(indexPath).proxyName.text;
              let videoReg = require('scripts/videoReg')
              $ui.menu({
                items: Object.keys(videoReg),
                handler: function (title, idx) {
                  let videoProxy = sender.info
                  videoProxy[title] = proxyName
                  sender.info = videoProxy
                  saveWorkspace()
                }
              })
            }
          }],
          borderWidth: 2,
          borderColor: $color("#f0f5f5"),
          template: {
            views: [{
              type: 'label',
              props: {
                id: 'proxyName',
                align: $align.left,
                line: 1,
                textColor: colorUtil.getColor("editorItemText"),
                font: $font(16),
              },
              layout: (make, view) => {
                make.width.equalTo(view.super).offset(-60)
                make.height.equalTo(view.super)
                make.left.equalTo(view.super).offset(15)
              }
            }, {
              type: "image",
              props: {
                id: "proxyAuto",
                icon: $icon("062", colorUtil.getColor("editorItemIcon"), $size(15, 15)),
                bgcolor: $color("clear"),
                hidden: true
              },
              layout: (make, view) => {
                make.right.equalTo(view.super).offset(-15)
                make.size.equalTo($size(15, 15))
                make.centerY.equalTo(view.super)
              }
            }]
          },
          // radius: 5
        },
        layout: (make, view) => {
          make.width.equalTo(view.super).offset(-20)
          make.centerX.equalTo(view.super)
          make.height.equalTo(screenHeight - 330 - (typeof $ui.window.next !== 'undefined' ? 45 : 0))
          make.top.equalTo($("serverControl").bottom)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            let proxyName = data.proxyName.text
            let isSelected = !data.proxyAuto.hidden
            let controlInfo = $("serverControl").info
            let currentGroup = controlInfo.currentProxyGroup
            let customProxyGroup = controlInfo.customProxyGroup || {}
            if (isSelected) {
              data.proxyAuto.hidden = true
              customProxyGroup[currentGroup] = customProxyGroup[currentGroup].filter(i => i !== proxyName)
            } else {
              data.proxyAuto.hidden = false
              customProxyGroup[currentGroup].push(proxyName)
            }
            let uiData = sender.data
            uiData[indexPath.section].rows[indexPath.row] = data
            sender.data = uiData
            $("serverControl").info = controlInfo
            saveWorkspace()
          },
          reorderFinished: data => {
            $thread.background({
              delay: 0,
              handler: function () {
                $("serverEditor").data = formatListData(data)
                saveWorkspace()
              }
            })
          },
          forEachItem: (view, indexPath) => {
            if (indexPath.row % 2 === 1) {
              view.bgcolor = $color("#f1f8ff")
            } else {
              view.bgcolor = $color("white")
            }
          },
          pulled: sender => {
            let listSections = $("serverEditor").data.filter(i => /^http/.test(i.url))
            linkHandler(listSections.map(i => i.url).join('\n'), {
              handler: (res, name, url, type) => {
                sender.endRefreshing()
                nodeImportHandler(res, name, url, type)
              }
            })
          }
        }
      }, {
        type: "input",
        props: {
          id: "serverSuffixEditor",
          placeholder: '节点后缀',
          text: '',
          font: $font(18),
          type: $kbType.ascii
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(10)
          make.width.equalTo(view.prev).offset(-125)
          make.height.equalTo(45)
          make.left.equalTo(view.prev.left)
        },
        events: {
          changed: sender => {
            saveWorkspace()
          },
          returned: sender => {
            sender.blur()
          }
        }
      }, {
        type: "view",
        props: {
          id: "outputFormatLabel",
          bgcolor: $color("#f1f1f1"),
          radius: 6
        },
        layout: (make, view) => {
          make.right.equalTo(view.super.right).offset(-10)
          make.top.equalTo(view.prev)
          make.height.equalTo(view.prev)
          make.width.equalTo(120)
        },
        views: [{
          type: "image",
          props: {
            data: $file.read('assets/menu_icon.png'),
            bgcolor: $color("clear"),
            hidden: true
          },
          layout: (make, view) => {
            make.left.equalTo(view.super).offset(10)
            make.height.width.equalTo(view.super.height).offset(-25)
            make.centerY.equalTo(view.super)
          }
        }, {
          type: "image",
          props: {
            id: "outputFormatIcon",
            data: $file.read('assets/today_surge.png'),
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.left.equalTo(view.super).offset(5)
            make.height.width.equalTo(view.super.height).offset(-15)
            make.centerY.equalTo(view.super).offset(1)
          }
        }, {
          type: 'label',
          props: {
            textColor: colorUtil.getColor("outputFormatText"),
            id: 'outputFormatType',
            text: 'Surge3 Pro',
            align: $align.center,
            font: $font("bold", 16),
            autoFontSize: true,
          },
          layout: (make, view) => {
            make.height.equalTo(view.super)
            make.width.equalTo(view.super).offset(-45)
            make.left.equalTo(view.prev.right)
            make.top.equalTo(view.super)
          }
        }],
        events: {
          tapped: sender => {
            renderOutputFormatMenu(sender)
          }
        }
      }, {
        type: "matrix",
        props: {
          id: "usualSettings",
          columns: 4,
          itemHeight: 40,
          spacing: 5,
          scrollEnabled: false,
          data: [{
            title: { text: 'ADS', bgcolor: btnOnFg, textColor: btnOffFg }
          }, {
            title: { text: 'MITM', bgcolor: btnOnFg, textColor: btnOffFg }
          }, {
            title: { text: 'Emoji', bgcolor: btnOnFg, textColor: btnOffFg }
          }, {
            title: { text: '导出', bgcolor: btnOnFg, textColor: btnOffFg }
          }],
          template: [{
            type: "label",
            props: {
              id: "title",
              align: $align.center,
              font: $font(14),
              radius: 5,
              borderColor: btnOnBg,
              borderWidth: 0.3,
            },
            layout: $layout.fill
          }]
        },
        layout: (make, view) => {
          make.width.equalTo(view.super).offset(-10)
          make.centerX.equalTo(view.super)
          make.height.equalTo(50)
          make.top.equalTo($("serverSuffixEditor").bottom).offset(5)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            if (indexPath.row === 2) {
              refreshListEmoji(isEmoji())
            }
            data.title.bgcolor = cu.isEqual(data.title.bgcolor, btnOnBg) ? btnOffBg : btnOnBg
            data.title.textColor = cu.isEqual(data.title.bgcolor, btnOnFg) ? btnOffFg : btnOnFg
            let uiData = $("usualSettings").data
            uiData[indexPath.row] = data
            $("usualSettings").data = uiData
            saveWorkspace()
          }
        }
      }]
    }, {
      type: "button",
      props: {
        id: "advanceBtn",
        titleColor: colorUtil.getColor("advanceBtnFg"),
        title: "进阶设置",
        bgcolor: colorUtil.getColor("advanceBtnBg")
      },
      layout: (make, view) => {
        make.width.equalTo((screenWidth / 2 - 15) * 0.686 - 10)
        make.left.equalTo(10)
        make.height.equalTo(40)
        make.top.equalTo($("usualSettings").bottom).offset(5)
      },
      events: {
        tapped: sender => {
          renderAdvanceUI()
        }
      }
    }, {
      type: "button",
      props: {
        id: "aboutBtn",
        titleColor: colorUtil.getColor("aboutBtnFg"),
        title: "关于",
        bgcolor: colorUtil.getColor("aboutBtnBg")
      },
      layout: (make, view) => {
        make.height.equalTo(40)
        make.width.equalTo((screenWidth / 2 - 15) * 0.314 + 5)
        make.left.equalTo($("advanceBtn").right).offset(5)
        make.top.equalTo($("usualSettings").bottom).offset(5)
      },
      events: {
        tapped: sender => {
          renderAboutUI()
        }
      }
    }, {
      type: "button",
      props: {
        id: "genBtn",
        titleColor: colorUtil.getColor("genBtnFg"),
        bgcolor: colorUtil.getColor("genBtnBg"),
        title: "生成配置"
      },
      layout: (make, view) => {
        make.width.equalTo((screenWidth - 10) * 0.5 - 5)
        make.height.equalTo(40)
        make.right.equalTo(view.super).offset(-10)
        make.top.equalTo($("usualSettings").bottom).offset(5)
      },
      events: {
        tapped: sender => {
          makeConf({
            onStart: () => {
              $("progressView").hidden = false
              $ui.animate({
                duration: 0.2,
                animation: function () {
                  $("progressView").alpha = 1
                }
              })
            },
            onProgress: (p, hint) => {
              hint !== '' && ($("loadingHintLabel").text = hint)
              $("progressBar").value = p
            },
            onDone: res => {
              $ui.animate({
                duration: 0.3,
                animation: function () {
                  $("progressView").alpha = 0
                },
                completion: function () {
                  $("loadingHintLabel").text = '处理中，请稍后'
                  $("progressBar").value = 0
                  $("progressView").hidden = true
                }
              })
              exportConf(res.fileName, res.fileData, res.target, res.actionSheet, false, () => {
                $http.stopServer()
              })
              $app.listen({
                resume: function () {
                  $http.stopServer()
                }
              })
            },
            onError: res => {
              $("progressView").value = 0
              $("progressView").hidden = true
            }
          })
        },
        longPressed: sender => {
          $share.sheet(['data.js', $file.read('data.js')])
        }
      }
    }, {
      type: "blur",
      props: {
        id: "progressView",
        style: 1,
        alpha: 0,
        hidden: true
      },
      layout: $layout.fill,
      views: [{
        type: "label",
        props: {
          id: "loadingHintLabel",
          text: "处理中，请稍后",
          textColor: $color("black"),
        },
        layout: (make, view) => {
          make.centerX.equalTo(view.super)
          make.centerY.equalTo(view.super).offset(-30)
        }
      }, {
        type: "progress",
        props: {
          id: "progressBar",
          value: 0
        },
        layout: (make, view) => {
          make.width.equalTo(screenWidth * 0.8)
          make.center.equalTo(view.super)
          make.height.equalTo(3)
        }
      }]
    },]
  })
}

let nodeImportHandler = (res, name, url, type = -1) => {
  // 如果是托管，url不为undefined
  // console.log([res, name, url])
  let listData = $("serverEditor").data || []
  let existsSec = listData.find(item => item.url === url)
  if (!res || res.length === 0) {
    $ui.alert({
      title: `${existsSec ? '更新' : '获取'}失败`,
      message: `${existsSec ? existsSec.title : url}`
    })
    return
  }
  let section = existsSec || { title: name, rows: [], url: url }
  section.rows = []
  let controlInfo = $("serverControl").info
  for (let idx in res) {
    if (res[idx].split("=")[1].trim() == 'direct') {
      // 过滤直连
      continue
    }
    let selected = controlInfo.customProxyGroup[controlInfo.currentProxyGroup].indexOf(res[idx].split('=')[0].trim()) > -1
    section.rows.push({
      proxyName: { text: res[idx].split('=')[0].trim() },
      proxyLink: res[idx],
      proxyAuto: { hidden: !selected },
      proxyType: type
    })
  }
  if (!existsSec) {
    listData.unshift(section)
  }
  $("serverEditor").data = listData
  saveWorkspace()
}

function formatListData(data) {
  if (!data || data.length === 0) {
    return []
  }
  let noGroup = []
  data = data.map(i => {
    if (i.title === '' || i.rows.length === 0) {
      noGroup = noGroup.concat(i.rows)
      return null
    }
    return i
  }).filter(i => i !== null)
  if (noGroup.length > 0) {
    data.unshift({ title: "", rows: noGroup })
  }
  return data
}


function loading(on) {
  let iconView = $("navLoadingIcon")
  if (on) {
    // iconView.play()
  } else {
    // iconView.pause()
  }
}

function refreshListEmoji(isEmoji) {
  function addEmoji(emojiSet, name) {
    let minIdx = 300;
    let resEmoji = '';
    for (let idx in emojiSet) {
      let reg = `(${emojiSet[idx].slice(1).join('|')})`
      let matcher = name.match(new RegExp(reg))
      if (matcher && matcher.index < minIdx) {
        minIdx = matcher.index
        resEmoji = emojiSet[idx][0]
      }
    }
    return minIdx !== 300 ? `${resEmoji} ${name}` : name
  }

  function removeEmoji(emojiSet, name) {
    let emoji = emojiSet.map(i => i[0])
    let reg = `(${emoji.join('|')}) `
    return name.replace(new RegExp(reg, 'g'), '')
  }

  let serverEditorData = $("serverEditor").data

  loading(true)
  $http.get({
    url: "https://raw.githubusercontent.com/Fndroid/country_emoji/master/emoji.json" + `?t=${new Date().getTime()}`
  }).then(resp => {
    loading(false)
    let emojiSet = resp.data
    $("serverEditor").data = serverEditorData.map(sec => {
      sec.rows = sec.rows.map(i => {
        i.proxyLink = isEmoji ? removeEmoji(emojiSet, i.proxyLink) : addEmoji(emojiSet, i.proxyLink)
        i.proxyName.text = i.proxyLink.split(/\s*=/)[0]
        return i
      })
      return sec
    })
    saveWorkspace()
  }).catch(error => {
    loading(false)
    $ui.alert("Emoji配置获取失败")
  })
}

function showAlterDialog(reg, rep, callback) {
  let fontSize = $text.sizeThatFits({
    text: rep,
    width: screenWidth - 100,
    font: $font(16)
  })
  let view = {
    type: "blur",
    layout: $layout.fill,
    props: {
      id: "alertBody",
      style: 1,
      alpha: 0
    },
    views: [{
      type: "view",
      props: {
        id: "alterMainView",
        bgcolor: $color("#ccc"),
        smoothRadius: 10
      },
      layout: (make, view) => {
        make.height.equalTo(230 + fontSize.height);
        make.width.equalTo(view.super).offset(-60);
        make.center.equalTo(view.super)
      },
      events: {
        tapped: sender => { }
      },
      views: [{
        type: "label",
        props: {
          text: "组别名称",
          font: $font("bold", 16)
        },
        layout: (make, view) => {
          make.top.equalTo(view.super).offset(20);
          make.left.equalTo(view.super).offset(10);
        }
      }, {
        type: "input",
        props: {
          id: "alterInputSection",
          text: reg,
          autoFontSize: true
        },
        events: {
          returned: sender => {
            sender.blur()
          }
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(10);
          make.width.equalTo(view.super).offset(-20);
          make.centerX.equalTo(view.super)
          make.left.equalTo(view.super).offset(10);
          make.height.equalTo(40)
        }
      }, {
        type: "label",
        props: {
          text: "节点信息",
          font: $font("bold", 16)
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(15);
          make.left.equalTo(view.super).offset(10);
        }
      }, {
        type: "text",
        props: {
          id: "alberInputLink",
          text: rep,
          autoFontSize: true,
          radius: 6,
          font: $font(16),
          bgcolor: $color("#eff0f2"),
          insets: $insets(10, 5, 10, 5)
        },
        events: {
          returned: sender => {
            sender.blur()
          }
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(10);
          make.width.equalTo(view.super).offset(-20);
          make.centerX.equalTo(view.super)
          make.left.equalTo(view.super).offset(10);
          make.height.equalTo(fontSize.height + 20)
        }
      }, {
        type: 'button',
        props: {
          icon: $icon("064", $color("#fff"), $size(20, 20)),
          id: 'confirmBtn',
          radius: 25
        },
        layout: (make, view) => {
          make.height.width.equalTo(50)
          make.bottom.equalTo(view.super).offset(-10)
          make.right.equalTo(view.super).offset(-10)
        },
        events: {
          tapped: sender => {
            callback && callback($("alterInputSection").text, $("alberInputLink").text);
            $("alertBody").remove();
          }
        }
      }]
    }],
    events: {
      tapped: sender => {
        sender.remove()
      }
    }
  }
  $("bodyView").add(view)
  $ui.animate({
    duration: 0.2,
    animation: () => {
      $("alertBody").alpha = 1
    }
  })
}

function renderOutputFormatMenu(superView) {
  $("bodyView").add({
    type: "view",
    props: {
      id: "outputFormatSelectorView",
      alpha: 0
    },
    layout: (make, view) => {
      make.height.width.equalTo(view.super)
      make.center.equalTo(view.super)
    },
    views: [{
      type: "blur",
      props: {
        style: 2,
        alpha: 1,
      },
      layout: $layout.fill,
      events: {
        tapped: sender => {
          hideView(sender);
        }
      }
    }, {
      type: "list",
      props: {
        id: "outputFormatSelectorItems",
        radius: 15,
        rowHeight: 50,
        alwaysBounceVertical: false,
        data: ['Surge 3 TF', 'Surge 3 Pro', 'Surge 2', 'Quantumult'],
        frame: resetFrame(superView.frame),
        header: {
          type: "label",
          props: {
            text: "选择导出格式",
            height: 50,
            font: $font("bold", 15),
            align: 1
          }
        },
        separatorHidden: true
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          let type = 'surge'
          if (data === 'Quantumult') {
            type = 'quan'
          } else if (data === 'Surge 2') {
            type = 'surge2'
          }
          $("outputFormatType").text = data
          $("outputFormatIcon").data = $file.read(`assets/today_${type}.png`)
          saveWorkspace()
          hideView(sender)
        }
      }
    }]
  })

  $ui.animate({
    duration: 0.3,
    damping: 0.8,
    velocity: 0.3,
    animation: () => {
      superView.scale(1.2)
      $("outputFormatSelectorView").alpha = 1
      $("outputFormatSelectorItems").frame = $rect(80, screenHeight - 430 + navBarHeight + statusBarHeight, screenWidth - 90, 250)
    }
  })

  function hideView(sender) {
    $ui.animate({
      duration: 0.2,
      velocity: 0.5,
      animation: () => {
        superView.scale(1)
        $("outputFormatSelectorView").alpha = 0;
        $("outputFormatSelectorItems").frame = resetFrame(superView.frame);
      },
      completion: () => {
        sender.super.remove();
      }
    });
  }
}

function resetFrame(frame) {
  return $rect(frame.x, frame.y + navBarHeight + statusBarHeight, frame.width, frame.height)
}

function archivesHandler() {
  const ARCHIVES = $addin.current.name + '/archivesFiles'
  if (!$drive.exists(ARCHIVES)) {
    $drive.mkdir(ARCHIVES)
  }
  console.log($drive.list(ARCHIVES))
  let latestVersion = ($app.info.build * 1) > 335
  let getFiles = function () {
    return $drive.list(ARCHIVES).map(i => {
      let path = i.runtimeValue().invoke('pathComponents').rawValue()
      let name = latestVersion ? i : path[path.length - 1]
      return {
        archiveName: {
          text: name,
          textColor: name === $cache.get('currentArchive') ? $color("red") : $color("black")
        }
      }
    })
  }
  $("bodyView").add({
    type: "view",
    props: {
      id: "archivesView",
      alpha: 0
    },
    layout: (make, view) => {
      make.height.width.equalTo(view.super)
      make.center.equalTo(view.super)
    },
    views: [{
      type: "blur",
      props: {
        style: 2,
        alpha: 1,
      },
      layout: $layout.fill,
      events: {
        tapped: sender => {
          $ui.animate({
            duration: 0.2,
            animation: () => {
              $("archivesView").alpha = 0
              $("archivesList").frame = $rect(0, 0, screenWidth, screenHeight)
            },
            completion: () => {
              sender.super.remove()
            }
          })
        }
      }
    }, {
      type: "list",
      props: {
        id: "archivesList",
        radius: 15,
        data: getFiles(),
        header: {
          type: "label",
          props: {
            text: "配置备份",
            height: 50,
            font: $font("bold", 20),
            align: $align.center
          }
        },
        template: {
          props: {
            bgcolor: $color("clear")
          },
          views: [
            {
              type: "label",
              props: {
                id: "archiveName"
              },
              layout: (make, view) => {
                make.width.equalTo(view.super).offset(-20)
                make.left.equalTo(view.super).offset(10)
                make.height.equalTo(view.super)
              }
            }
          ]
        },
        actions: [{
          title: "删除",
          color: $color('red'),
          handler: (sender, indexPath) => {
            let fileName = sender.object(indexPath).archiveName.text
            let success = $drive.delete(ARCHIVES + '/' + fileName)
            if (success) {
              sender.data = getFiles()
            }
          }
        }, {
          title: "导出",
          handler: (sender, indexPath) => {
            let fileName = sender.object(indexPath).archiveName.text
            $share.sheet(['data.js', $drive.read(ARCHIVES + "/" + fileName)])
          }
        }, {
          title: "覆盖",
          color: $color("tint"),
          handler: (sender, indexPath) => {
            let filename = sender.object(indexPath).archiveName.text
            let success = $drive.write({
              data: $file.read('data.js'),
              path: ARCHIVES + '/' + filename
            })
            $ui.toast("配置文件覆盖" + (success ? "成功" : "失败"))
          }
        }]
      },
      layout: (make, view) => {
        make.height.equalTo(view.super).dividedBy(12 / 7)
        make.width.equalTo(view.super).dividedBy(12 / 9)
        make.center.equalTo(view.super)
      },
      events: {
        didSelect: (sender, indexPath, item) => {
          let data = item.archiveName.text
          if (/\..*?\.icloud/.test(data)) {
            $ui.alert(`备份文件不在本地，请先进入iCloud下载，路径为：文件 -> JSBox -> ${$addin.current.name} -> archivesFiles`)
            return
          }
          let success = $file.write({
            data: $drive.read(ARCHIVES + '/' + data),
            path: "data.js"
          })
          if (success) {
            $cache.set('currentArchive', data)
            $app.notify({
              name: 'loadData'
            })
            $ui.animate({
              duration: 0.2,
              animation: () => {
                $("archivesView").alpha = 0
                $("archivesList").frame = $rect(0, 0, screenWidth, screenHeight)
              },
              completion: () => {
                sender.super.remove()
              }
            })
          }
        }
      }
    }, {
      type: "button",
      props: {
        title: "＋",
        circular: true,
      },
      layout: (make, view) => {
        make.bottom.equalTo(view.prev)
        make.right.equalTo(view.prev).offset(-5)
        make.height.width.equalTo(50)
      },
      events: {
        tapped: sender => {
          $input.text({
            type: $kbType.default,
            placeholder: "请输入备份文件名",
            handler: function (text) {
              if (text === '') {
                $ui.error("无法创建备份")
                return
              }
              let success = $drive.write({
                data: $file.read('data.js'),
                path: ARCHIVES + '/' + text
              })
              if (success) {
                $cache.set('currentArchive', text)
                sender.prev.data = getFiles()
              }
            }
          })
        }
      }
    }]
  })

  $ui.animate({
    duration: .3,
    damping: 0.8,
    velocity: 0.3,
    animation: () => {
      $("archivesView").alpha = 1
      $("archivesList").scale(1.1)
    }
  })
}

function specialProxyGroup() {
  if (getRulesReplacement()) {
    $ui.alert('检测到有规则替换，无法使用特殊代理设置')
    return
  }
  let groups = getProxyGroups();
  const menuItems = groups.concat(['🚀 Direct', '查看设置', '清除设置']);
  $ui.menu({
    items: menuItems,
    handler: function (mTitle, idx) {
      if (idx === menuItems.length - 1) {
        $("serverEditor").info = {};
        saveWorkspace();
      }
      else if (idx === menuItems.length - 2) {
        let videoProxy = $("serverEditor").info;
        let output = [];
        for (let k in videoProxy) {
          output.push(`${k} - ${videoProxy[k]}`);
        }
        $ui.alert(output.length > 0 ? output.join('\n') : "无设置特殊代理");
      }
      else {
        let videoReg = require('scripts/videoReg')
        $ui.menu({
          items: Object.keys(videoReg),
          handler: function (title, idx) {
            let proxyName = mTitle;
            let videoProxy = $("serverEditor").info;
            videoProxy[title] = proxyName;
            $("serverEditor").info = videoProxy;
            saveWorkspace();
          }
        });
      }
    }
  });
}

function genControlItems() {
  let currentProxyGroup = PROXY_HEADER
  try {
    currentProxyGroup = $("serverControl").info.currentProxyGroup
  } catch (e) { }
  return [{
    title: { text: '节点倒序' }
  }, {
    title: { text: currentProxyGroup }
  }, {
    title: { text: '特殊代理' }
  }, {
    title: { text: '删除分组' }
  }]
}

function getProxyGroups() {
  let fileData = JSON.parse($file.read(FILE).string)
  let proxyGroupSettings = fileData.proxyGroupSettings
  let groups = proxyGroupSettings.split(/[\n\r]/).filter(i => /^(?!\/\/)[\s\S]+=[\s\S]+/.test(i)).map(i => i.split('=')[0].trim())
  return groups
}

function groupShortcut() {
  let controlInfo = $("serverControl").info
  let currentProxyGroup = controlInfo.currentProxyGroup || PROXY_HEADER
  let customProxyGroup = controlInfo.customProxyGroup || {}
  let menuItems = Object.keys(customProxyGroup).sort()
  $("bodyView").add({
    type: "view",
    props: {
      id: "placeholderView",
      alpha: 0
    },
    layout: (make, view) => {
      make.height.width.equalTo(view.super)
      make.center.equalTo(view.super)
    },
    views: [{
      type: "blur",
      props: {
        style: 2,
        alpha: 1,
      },
      layout: $layout.fill,
      events: {
        tapped: sender => {
          removeAnimation()
        }
      }
    }, {
      type: "list",
      props: {
        id: "placeholderList",
        radius: 15,
        data: menuItems,
        header: {
          type: "label",
          props: {
            text: "占位符",
            height: 50,
            font: $font("bold", 20),
            align: $align.center
          }
        },
        actions: [{
          title: "删除",
          color: $color('red'),
          handler: (sender, indexPath) => {
            let title = sender.object(indexPath)
            if ([PROXY_HEADER, 'Proxy Header'].indexOf(title) > -1) {
              $ui.error("此占位符无法删除")
              return
            }
            delete customProxyGroup[title]
            $("serverControl").info = controlInfo
            saveWorkspace()
            $("placeholderList").data = Object.keys(customProxyGroup).sort()
          }
        }, {
          title: "重命名",
          handler: (sender, indexPath) => {
            let title = sender.object(indexPath)
            if ([PROXY_HEADER, 'Proxy Header'].indexOf(title) > -1) {
              $ui.error("此占位符无法重命名")
              return
            }
            $input.text({
              type: $kbType.default,
              placeholder: title,
              handler: function (text) {
                if (sender.data.indexOf(text) > -1) {
                  $ui.error("此名称已被占用")
                } else {
                  customProxyGroup[text] = customProxyGroup[title]
                  delete customProxyGroup[title]
                  if ($("serverControl").info.currentProxyGroup === title) {
                    switchToGroup(text)
                  }
                  $("serverControl").info = controlInfo
                  saveWorkspace()
                  sender.data = Object.keys(customProxyGroup).sort()
                }
              }
            })
          }
        }, {
          title: "删除节点",
          color: $color('tint'),
          handler: (sender, indexPath) => {
            let title = sender.object(indexPath)
            let headers = customProxyGroup[title]
            let editorData = $("serverEditor").data
            editorData.map(section => {
              section.rows = section.rows.filter(item => headers.every(k => item.proxyName.text.indexOf(k) === -1))
              return section
            })
            $("serverEditor").data = editorData
            saveWorkspace()
            $ui.toast("已删除占位符对应节点")
            removeAnimation()
          }
        }]
      },
      layout: (make, view) => {
        make.height.equalTo(view.super).dividedBy(12 / 7)
        make.width.equalTo(view.super).dividedBy(12 / 9)
        make.center.equalTo(view.super)
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          $ui.toast(`当前占位符为：${data}`)
          switchToGroup(data)
          removeAnimation()
        }
      }
    }, {
      type: "button",
      props: {
        title: "＋",
        circular: true,
      },
      layout: (make, view) => {
        make.bottom.equalTo(view.prev)
        make.right.equalTo(view.prev).offset(-5)
        make.height.width.equalTo(50)
      },
      events: {
        tapped: sender => {
          $input.text({
            type: $kbType.default,
            placeholder: "建议：xxxHeader",
            handler: function (text) {
              if ([PROXY_HEADER, 'Proxy Header', ''].indexOf(text) > -1) {
                $ui.error("占位符名称冲突")
                return
              }
              customProxyGroup[text] = []
              $("serverControl").info = controlInfo
              saveWorkspace()
              $("placeholderList").data = Object.keys(customProxyGroup).sort()
            }
          })
        }
      }
    }]
  })

  function removeAnimation() {
    $ui.animate({
      duration: 0.2,
      animation: () => {
        $("placeholderView").alpha = 0
        $("placeholderList").frame = resetFrame($("serverEditor").frame)
      },
      completion: () => {
        $("placeholderView").remove()
      }
    })
  }

  $ui.animate({
    duration: .3,
    damping: 0.8,
    animation: () => {
      $("placeholderView").alpha = 1
      $("placeholderList").scale(1.1)
    }
  })

  function switchToGroup(title) {
    let group = customProxyGroup[title];
    // 保存当前编辑策略组
    controlInfo.currentProxyGroup = title;
    $("serverControl").info = controlInfo;
    // 恢复选中的策略组UI
    let listData = $("serverEditor").data || [];
    listData = listData.map(section => {
      section.rows = section.rows.map(item => {
        item.proxyAuto.hidden = !(group.indexOf(item.proxyName.text) > -1)
        return item;
      });
      return section;
    });
    $("serverEditor").data = listData;
    $("serverControl").data = genControlItems()
  }
}

function listReplace(sender, indexPath, obj) {
  let oldData = sender.data
  if (indexPath.section != null) {
    oldData[indexPath.section].rows[indexPath.row] = obj
  } else {
    oldData[indexPath.row] = obj
  }
  sender.data = oldData
}

function getAutoRules(url, done, hint = '') {
  return new Promise((resolve, reject) => {
    $http.get({
      url: url,
      handler: function (resp) {
        if (done) done(hint)
        resolve(resp.data)
      }
    })
  })
}

function importMenu(params) {
  let staticItems = ['剪贴板', '二维码', '空节点']
  $ui.menu({
    items: staticItems,
    handler: function (title, idx) {
      if (title === staticItems[0]) {
        let clipText = $clipboard.text
        linkHandler(clipText, params)
      } else if (title === staticItems[1]) {
        $qrcode.scan({
          handler(string) {
            linkHandler(string, params)
          }
        })
      } else if (title === staticItems[2]) {
        params.handler(['Empty Node = '], 'Default', `emptynode${new Date().getTime()}`)
      }
    }
  })
}

function isEmoji() {
  try {
    let advanceSettings = JSON.parse($file.read(FILE).string)
    let workspace = advanceSettings.workspace
    let usualData = workspace.usualData

    let usualValue = function (key) {
      return usualData.find(i => i.title.text == key) ? usualData.find(i => i.title.text == key).title.bgcolor : false
    }
    return usualValue('Emoji')
  } catch (e) {
    return false
  }
}

function linkHandler(url, params) {
  let emoji = isEmoji()
  let servers = {
    shadowsocks: [],
    surge: [],
    online: [],
    vmess: [],
    ignore: [],
    shadowsocksr: []
  }

  if (!url) {
    $ui.alert('没有识别到有效链接')
    return
  }

  let urls = url.split(/[\r\n]+/g).map(i => i.trim()).filter(i => i !== '')
  urls.forEach(item => {
    if (/^ss:\/\//.test(item)) {
      servers.shadowsocks.push(item)
    } else if (/^https?:\/\//.test(item)) {
      servers.online.push(item)
    } else if (/[\S\s]+=[\s]*(custom|ss|http|https|socks5|socks5-tls|external)/.test(item)) {
      servers.surge.push(item)
    } else if (/^vmess:\/\//.test(item)) {
      servers.vmess.push(item)
    } else if (/^ssr:\/\//.test(item)) {
      servers.shadowsocksr.push(item)
    } else {
      servers.ignore.push(item)
    }
  })

  let updateHint = ''
  updateHint += servers.shadowsocks.length > 0 ? `\nShadowsocks链接${servers.shadowsocks.length}个\n` : ''
  updateHint += servers.shadowsocksr.length > 0 ? `\nShadowsocksR链接${servers.shadowsocksr.length}个\n` : ''
  updateHint += servers.surge.length > 0 ? `\nSurge链接${servers.surge.length}个\n` : ''
  updateHint += servers.vmess.length > 0 ? `\nV2Ray链接${servers.vmess.length}个\n` : ''
  updateHint += servers.online.length > 0 ? `\n托管或订阅${servers.online.length}个\n` : ''
  // $ui.alert({
  //     title: '更新概况',
  //     message: updateHint
  // })

  function addEmoji(emojiSet, link) {
    let name = link.split(/=/)[0]
    let minIdx = 300;
    let resEmoji = '';
    for (let idx in emojiSet) {
      let reg = `(${emojiSet[idx].slice(1).join('|')})`
      let matcher = name.match(new RegExp(reg))
      if (matcher && matcher.index < minIdx) {
        minIdx = matcher.index
        resEmoji = emojiSet[idx][0]
      }
    }
    return minIdx !== 300 ? `${resEmoji} ${link}` : link
  }

  function detailHandler(emojiSet = null) {
    for (let k in servers) {
      if (servers[k].length === 0) {
        continue
      }
      if (k === 'shadowsocks') {
        proxyUtil.proxyFromURL({
          ssURL: servers[k],
          handler: res => {
            params.handler(emojiSet ? res.servers.map(i => addEmoji(emojiSet, i)) : res.servers, res.sstag, servers[k].join('\n'))
          }
        })
      } else if (k === 'surge') {
        let urls = servers[k].map(i => i.replace(/,[\s]*udp-relay=true/, ''))
        let result = []
        for (let idx in urls) {
          result[idx] = urls[idx]
        }
        $delay(0.3, function () {
          params.handler(emojiSet ? result.map(i => addEmoji(emojiSet, i)) : result, urls.length > 1 ? `批量Surge链接（${urls.length}）` : result[0].split('=')[0].trim(), urls.join('\n'))
        })
      } else if (k === 'online') {
        loading(true)
        proxyUtil.proxyFromConf({
          urls: servers[k],
          handler: res => {
            console.log('res', res);
            loading(false)
            params.handler(emojiSet ? res.servers.map(i => addEmoji(emojiSet, i)) : res.servers, res.filename, res.url, res.type)
          }
        })
      } else if (k === 'vmess') {
        let res = proxyUtil.proxyFromVmess(servers[k])
        params.handler(emojiSet ? res.servers.map(i => addEmoji(emojiSet, i)) : res.servers, res.sstag, servers[k].join('\n'))
      } else if (k === 'shadowsocksr') {
        let res = proxyUtil.proxyFromSSR(servers[k])
        params.handler(emojiSet ? res.servers.map(i => addEmoji(emojiSet, i)) : res.servers, res.sstag, servers[k].join('\n'))
      } else {
        $ui.alert('剪贴板存在无法识别的行：\n\n' + servers.ignore.join('\n') + '\n\n以上行将被丢弃！')
      }
    }
  }

  if (emoji) {
    loading(true)
    $http.get({
      url: "https://raw.githubusercontent.com/Fndroid/country_emoji/master/emoji.json" + `?t=${new Date().getTime()}`
    }).then(resp => {
      loading(false)
      let emojiSet = resp.data
      detailHandler(emojiSet)
    }).catch(error => {
      loading(false)
      $ui.alert("Emoji配置获取失败")
    })
  } else {
    detailHandler(null)
  }
}

function write2file(key, value) {
  let content = JSON.parse($file.read(FILE).string)
  content[key] = value
  $file.write({
    data: $data({ "string": JSON.stringify(content) }),
    path: FILE
  })
}

function renderAdvanceUI() {
  let previewData = JSON.parse($file.read(FILE).string)
  let placeHolders = Object.keys(previewData.workspace.customProxyGroup)
  let inputViewData = []
  for (let idx in settingKeys) {
    let content = previewData[settingKeys[idx]]
    let view = {
      type: "text",
      props: {
        text: content,
        bgcolor: $color("#f0f5f5"),
        font: $font(14)
      },
      events: {
        didChange: sender => {
          let content = sender.text
          if (sender.text == '') {
            content = $file.read('defaultConf/' + settingKeys[idx]).string
            sender.text = content
          }
          write2file(settingKeys[idx], content)
        }
      }
    }
    if (idx == 2) {
      view.props.accessoryView = {
        type: "view",
        props: {
          height: 44,
          bgcolor: $color("#ced4d4")
        },
        views: [{
          type: "label",
          props: {
            text: "完成",
            align: $align.center
          },
          layout: (make, view) => {
            make.right.equalTo(view.super)
            make.top.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(60)
          },
          events: {
            tapped: sender => {
              $("inputViews").views[2].blur()
            }
          }
        }, {
          type: "scroll",
          props: {
            alwaysBounceHorizontal: true,
            alwaysBounceVertical: false,
            showsHorizontalIndicator: false
          },
          views: placeHolders.map((i, idx) => {
            return {
              type: 'label',
              props: {
                text: i,
                lines: 1,
                font: $font("bold", 15),
                align: $align.center,
                bgcolor: $color("#fff"),
                radius: 5,
                textColor: $color('#000')
              },
              layout: (make, view) => {
                make.size.equalTo($size(i.length * 9 + 10, 34))
                make.centerY.equalTo(view.super)
                make.top.equalTo(view.suepr).offset(5)
                if (idx > 0) {
                  make.left.equalTo(view.prev.right).offset(5)
                } else {
                  make.left.equalTo(5)
                }
              },
              events: {
                tapped: sender => {
                  let inputView = $("inputViews").views[2]
                  inputView.runtimeValue().$insertText(sender.text)
                  // let sr = inputView.selectedRange
                  // let old = inputView.text.split('')
                  // old.splice(sr.location, sr.length, sender.text)
                  // inputView.text = old.join('')
                }
              }
            }
          }),
          layout: (make, view) => {
            make.left.equalTo(view.super)
            make.top.equalTo(view.super)
            make.height.equalTo(view.super).offset(0)
            make.width.equalTo(view.super).offset(-60)
          }
        }]
      }
    }
    inputViewData.push(view)
  }
  let genControlBnts = function (idx) {
    let titleTexts = ['小组件流量', '常规', '代理分组', '代理规则', '本地DNS映射', 'URL重定向', 'SSID', 'Header修改', '主机名', '配置根证书']
    const sbgc = colorUtil.getColor("advanceGridOnBg")
    const stc = colorUtil.getColor("advanceGridOnFg")
    const dbgc = colorUtil.getColor("advanceGridOffBg")
    const dtc = colorUtil.getColor("advanceGridOffFg")
    return titleTexts.map((item, i) => {
      return {
        title: { text: item, bgcolor: i === idx ? sbgc : dbgc, radius: 5, color: i == idx ? stc : dtc }
      }
    })
  }
  $ui.push({
    type: "scroll",
    props: {
      title: "进阶设置",
      navBarHidden: true,
      statusBarHidden: colorUtil.getColor("statusBar", true) === 'clear' ? true : false,
      statusBarStyle: colorUtil.getColor("statusBar", true) === '#ffffff' ? 1 : 0,
    },
    views: [{
      type: "view",
      props: {
        id: "navBar",
        bgcolor: colorUtil.getColor("navBar")
      },
      layout: (make, view) => {
        make.height.equalTo(navBarHeight + statusBarHeight)
        make.width.equalTo(view.super)
      },
      views: [{
        type: "label",
        props: {
          text: "进阶设置",
          textColor: colorUtil.getColor("navTitleText"),
          font: $font("bold", 25)
        },
        layout: (make, view) => {
          make.height.equalTo(navBarHeight)
          make.top.equalTo(statusBarHeight)
          make.left.equalTo(15)
        }
      }, {
        type: "image",
        props: {
          icon: $icon("225", colorUtil.getColor("navIconRight"), $size(25, 25)),
          bgcolor: $color("clear")
        },
        layout: (make, view) => {
          make.right.equalTo(view.super).offset(-15)
          make.height.width.equalTo(25)
          make.bottom.equalTo(view.super).offset(-10)
        },
        events: {
          tapped: sender => {
            $ui.pop()
          }
        }
      }]
    }, {
      type: "gallery",
      props: {
        id: "inputViews",
        items: inputViewData,
        interval: 0,
        smoothRadius: 10,
      },
      layout: (make, view) => {
        make.height.equalTo(screenHeight - 325 - statusBarHeight - navBarHeight)
        make.width.equalTo(view.super).offset(-20)
        make.centerX.equalTo(view.super)
        make.top.equalTo(navBarHeight + statusBarHeight + 10)
      },
      events: {
        changed: sender => {
          let idx = sender.page
          $("settingsControl").data = genControlBnts(idx)
        }
      }
    }, {
      type: "matrix",
      props: {
        columns: 2,
        id: "settingsControl",
        itemHeight: 40,
        bgcolor: $color("#ffffff"),
        spacing: 3,
        data: genControlBnts(0),
        template: [{
          type: "label",
          props: {
            id: "title",
            align: $align.center,
            font: $font("bold", 14)
          },
          layout: $layout.fill
        }]
      },
      layout: (make, view) => {
        make.height.equalTo(220)
        make.centerX.equalTo(view.super)
        make.width.equalTo(view.super).offset(-13)
        make.top.equalTo(view.prev.bottom).offset(5)
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          let idx = indexPath.row
          $("inputViews").page = idx
        }
      }
    }, {
      type: "label",
      props: {
        text: "上述设置点击完成生效，清空保存一次恢复默认",
        font: $font(12),
        textColor: $color("#595959"),
        align: $align.center
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).offset(0)
        make.width.equalTo(view.super)
        make.height.equalTo(30)
        make.centerX.equalTo(view.super)
      }
    }, {
      type: "button",
      props: {
        title: '还原全部进阶设置',
        bgcolor: $color("#ff6840")
      },
      layout: (make, view) => {
        make.width.equalTo(view.super).offset(-40)
        make.centerX.equalTo(view.super)
        make.top.equalTo(view.prev.bottom).offset(10)
        make.height.equalTo(40)
      },
      events: {
        tapped: sender => {
          $ui.alert({
            title: "提示",
            message: "是否还原配置，还原后无法恢复",
            actions: [{
              title: 'Cancel',
              handler: () => { }
            }, {
              title: 'OK',
              handler: () => {
                let previewData = JSON.parse($file.read(FILE).string)
                for (let idx in settingKeys) {
                  let defaultValue = $file.read(`defaultConf/${settingKeys[idx]}`).string
                  previewData[settingKeys[idx]] = defaultValue
                }
                $file.write({
                  data: $data({ "string": JSON.stringify(previewData) }),
                  path: FILE
                })
                $ui.pop()
              }
            }]
          })
        }
      }
    }]
  })
}

function renderAboutUI() {
  let previewMD = function (title, filePath) {
    $ui.push({
      props: {
        title: title
      },
      views: [{
        type: "markdown",
        props: {
          id: "",
          content: $file.read(filePath).string
        },
        layout: $layout.fill
      }]
    })
  }

  $ui.push({
    props: {
      title: "关于",
      id: "aboutMainView",
      navBarHidden: true,
      statusBarHidden: colorUtil.getColor("statusBar", true) === 'clear' ? true : false,
      statusBarStyle: colorUtil.getColor("statusBar", true) === '#ffffff' ? 1 : 0,
    },
    views: [{
      type: "view",
      props: {
        id: "navBar",
        bgcolor: colorUtil.getColor("navBar")
      },
      layout: (make, view) => {
        make.height.equalTo(navBarHeight + statusBarHeight)
        make.width.equalTo(view.super)
      },
      views: [{
        type: "label",
        props: {
          text: "脚本相关",
          textColor: colorUtil.getColor("navTitleText"),
          font: $font("bold", 25)
        },
        layout: (make, view) => {
          make.height.equalTo(navBarHeight)
          make.top.equalTo(statusBarHeight)
          make.left.equalTo(15)
        }
      }, {
        type: "image",
        props: {
          icon: $icon("225", colorUtil.getColor("navIconRight"), $size(25, 25)),
          bgcolor: $color("clear")
        },
        layout: (make, view) => {
          make.right.equalTo(view.super).offset(-15)
          make.height.width.equalTo(25)
          make.bottom.equalTo(view.super).offset(-10)
        },
        events: {
          tapped: sender => {
            $ui.pop()
          }
        }
      }]
    }, {
      type: "scroll",
      props: {
        id: "mainAboutView",
        contentSize: $size(0, 1000)
      },
      layout: (make, view) => {
        make.top.equalTo(navBarHeight + statusBarHeight);
        make.width.equalTo(view.super)
        make.height.equalTo(view.super).offset(navBarHeight + statusBarHeight)
      },
      views: [{
        type: "label",
        props: {
          text: "文档说明",
          font: $font(13),
          textColor: $color("#505050")
        },
        layout: (make, view) => {
          make.top.equalTo(view.super).offset(10)
          make.height.equalTo(30)
          make.left.equalTo(15)
        }
      }, {
        type: "list",
        props: {
          data: ["🗂  脚本简介", "🛠  使用手册", "📃  更新日志", "🖥  论坛导航"],
          scrollEnabled: false
        },
        layout: (make, view) => {
          make.width.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).offset(0)
          make.height.equalTo(180)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            if (indexPath.row === 0) {
              previewMD(data, 'docs.md')
            } else if (indexPath.row === 1) {
              $safari.open({
                url: "https://github.com/Fndroid/jsbox_script/wiki/Rules-lhie1"
              })
            } else if (indexPath.row === 2) {
              previewMD(data, 'updateLog.md')
            } else {
              $safari.open({
                url: "https://jsboxbbs.com/d/290-lhie1"
              })
            }
          }
        }
      }, {
        type: "label",
        props: {
          text: "外部拓展",
          font: $font(13),
          textColor: $color("#505050")
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20)
          make.height.equalTo(30)
          make.left.equalTo(15)
        }
      }, {
        type: "list",
        props: {
          data: ["🤖️  Rules-lhie1托管", "🎩  Quantumult去FA更新"],
          scrollEnabled: false
        },
        layout: (make, view) => {
          make.width.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).offset(0)
          make.height.equalTo(90)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            if (indexPath.row === 0) {
              $app.openURL("https://t.me/rules_lhie1_bot")
            } else {
              $safari.open({
                url: "https://jsboxbbs.com/d/474-quantumult-filter-action",
              })
            }
          }
        }
      }, {
        type: "label",
        props: {
          text: "致谢捐献",
          font: $font(13),
          textColor: $color("#505050")
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20)
          make.height.equalTo(30)
          make.left.equalTo(15)
        }
      }, {
        type: "list",
        props: {
          data: ["🙏  捐献打赏名单", "👍  赏杯咖啡支持作者"],
          scrollEnabled: false
        },
        layout: (make, view) => {
          make.width.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).offset(0)
          make.height.equalTo(90)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            if (indexPath.row === 0) {
              $http.get('https://raw.githubusercontent.com/Fndroid/sponsor_list/master/sponsors.md').then(res => {
                let success = $file.write({
                  data: $data({string: res.data}),
                  path: 'donate.md'
                })
                success && previewMD(data, 'donate.md')
              })
            } else if (indexPath.row === 1) {
              $ui.alert({
                title: '感谢支持',
                message: '作者投入大量时间和精力对脚本进行开发和完善，你愿意给他赏杯咖啡支持一下吗？',
                actions: [{
                  title: "支付宝",
                  handler: () => {
                    $app.openURL($qrcode.decode($file.read("assets/thankyou2.jpg").image))
                  }
                }, {
                  title: "微信",
                  handler: () => {
                    $quicklook.open({
                      image: $file.read("assets/thankyou.jpg").image
                    })
                  }
                }, {
                  title: "返回"
                }]
              })
            } else {
              // $clipboard.text = 'GxsAtS84U7'
              // $app.openURL("alipay://")
              $app.openURL("https://qr.alipay.com/c1x047207ryk0wiaj6m6ye3")
            }
          }
        }
      }, {
        type: "label",
        props: {
          text: "反馈联系",
          font: $font(13),
          textColor: $color("#505050")
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20)
          make.height.equalTo(30)
          make.left.equalTo(15)
        }
      }, {
        type: "list",
        props: {
          data: ["📠  Telegram", "💡  GitHub", "📅  Channel"],
          scrollEnabled: false
        },
        layout: (make, view) => {
          make.width.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).offset(0)
          make.height.equalTo(140)
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            if (indexPath.row === 0) {
              $safari.open({
                url: "https://t.me/Rules_lhie1",
              })
            } else if (indexPath.row === 1) {
              $safari.open({
                url: "https://github.com/Fndroid/jsbox_script/tree/master/Rules-lhie1/README.md",
              })
            } else {
              $safari.open({
                url: "https://t.me/Fndroids",
              })
            }
          }
        }
      }, {
        type: "label",
        props: {
          text: "版本号：" + updateUtil.getCurVersion(),
          font: $font(13),
          textColor: $color("#505050")
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20)
          make.height.equalTo(30)
          make.centerX.equalTo(view.super)
        }
      }]
    }]
  })
}

function deleteServerGroup() {
  let serverData = $("serverEditor").data
  let sections = serverData.map(i => {
    if (i.title === '') {
      return '无分组节点'
    }
    return i.title
  })
  $ui.menu({
    items: sections.concat(['全部删除', '关键字删除']),
    handler: function (title, idx) {
      if (title === '全部删除') {
        $("serverEditor").data = []
      } else if (title === '关键字删除') {
        $input.text({
          type: $kbType.default,
          placeholder: "关键字，空格隔开",
          text: $("serverControl").info.deleteKeywords || '',
          handler: function (text) {
            let keywords = text.split(/\s+/g).filter(i => i !== '')
            let editorData = $("serverEditor").data
            editorData.map(section => {
              section.rows = section.rows.filter(item => keywords.every(k => !(new RegExp(k, 'g')).test(item.proxyName.text)))
              return section
            })
            $("serverEditor").data = editorData
            let controlInfo = $("serverControl").info
            controlInfo.deleteKeywords = text
            $("serverControl").info = controlInfo
            saveWorkspace()
          }
        })
      } else {
        serverData.splice(idx, 1)
        $("serverEditor").data = serverData
      }
      saveWorkspace()
    }
  })
}

function reverseServerGroup() {
  let serverData = $("serverEditor").data
  let sections = serverData.map(i => i.title)
  if (sections.length === 1) {
    serverData[0].rows.reverse()
    $("serverEditor").data = serverData
    saveWorkspace()
    return
  }
  $ui.menu({
    items: sections.concat(['组别倒序']),
    handler: function (title, idx) {
      if (idx === sections.length) {
        $("serverEditor").data = serverData.reverse()
      } else {
        serverData[idx].rows.reverse()
        $("serverEditor").data = serverData
      }
      saveWorkspace()
    }
  })
}

let filePartReg = function (name) {
  let reg = `\\[${name}\\]([\\S\\s]*?)(?:\\[General\\]|\\[Replica\\]|\\[Proxy\\]|\\[Proxy Group\\]|\\[Rule\\]|\\[Host\\]|\\[URL Rewrite\\]|\\[Header Rewrite\\]|\\[SSID Setting\\]|\\[MITM\\]|\\[URL-REJECTION\\]|\\[HOST\\]|\\[POLICY\\]|\\[REWRITE\\]|$)`
  return new RegExp(reg)
}

function setUpWorkspace() {
  $app.listen({
    ready: function () {
      $("navLoadingIcon").play({
        fromProgress: 0,
        toProgress: 0.6,
      })
      $app.notify({
        name: 'loadData'
      })
    },
    resume: () => {

    },
    loadData: () => {
      let file = JSON.parse($file.read(FILE).string)
      if (file && file.workspace) {
        let workspace = file.workspace
        $("fileName").text = workspace.fileName || ''
        $("serverSuffixEditor").text = workspace.serverSuffix || ''
        $("serverURL").info = workspace.withEmoji || false
        let customProxyGroup = workspace.customProxyGroup || {}
        let defaultGroupName = PROXY_HEADER
        if (!(defaultGroupName in customProxyGroup)) {
          customProxyGroup[defaultGroupName] = []
        }
        let defaultGroup = customProxyGroup[defaultGroupName]
        $("serverEditor").data = workspace.serverData.map(section => {
          section.rows.map(item => {
            item.proxyName = {
              text: item.proxyName.text
            }
            item.proxyAuto = {
              hidden: !(defaultGroup.indexOf(item.proxyName.text) > -1)
            }
            return item
          })
          return section
        })
        let usualSettingsData = workspace.usualData
        let nd = $("usualSettings").data.map(item => {
          let sd = usualSettingsData.find(i => i.title.text === item.title.text)
          if (sd) {
            item.title.bgcolor = sd.title.bgcolor ? btnOnBg : btnOffBg
            item.title.textColor = sd.title.textColor ? btnOnFg : btnOffFg
          } else {
            item.title.bgcolor = btnOffFg
            item.title.textColor = btnOffFg
          }
          return item
        })
        $("usualSettings").data = nd
        $("serverEditor").info = workspace.videoProxy || {}
        $("serverControl").info = {
          deleteKeywords: workspace.deleteKeywords || '',
          customProxyGroup: customProxyGroup,
          currentProxyGroup: defaultGroupName
        }
        let outputFormat = workspace.outputFormat || 'Surge3'
        let type = 'surge'
        if (outputFormat === 'Quantumult') {
          type = 'quan'
        } else if (outputFormat === 'Surge 2') {
          type = 'surge2'
        }
        $("outputFormatType").text = outputFormat
        $("outputFormatIcon").data = $file.read(`assets/today_${type}.png`)
      } else if (file && !file.workspace) {
        let customProxyGroup = {}
        let defaultGroupName = PROXY_HEADER
        customProxyGroup[defaultGroupName] = []
        let defaultGroup = customProxyGroup[defaultGroupName]
        $("serverControl").info = {
          deleteKeywords: '',
          customProxyGroup: customProxyGroup,
          currentProxyGroup: defaultGroupName
        }
      }
    }
  })
}

function saveWorkspace() {
  let workspace = {
    fileName: $("fileName").text,
    serverData: $("serverEditor").data,
    withEmoji: $("serverURL").info || false,
    usualData: $("usualSettings").data.map(i => {
      i.title.bgcolor = cu.isEqual(btnOnBg, i.title.bgcolor)
      i.title.textColor = cu.isEqual(btnOnFg, i.title.textColor)
      return i
    }),
    outputFormat: $("outputFormatType").text,
    serverSuffix: $("serverSuffixEditor").text,
    videoProxy: $("serverEditor").info || {},
    deleteKeywords: $("serverControl").info.deleteKeywords || '',
    customProxyGroup: $("serverControl").info.customProxyGroup || {}
  }
  let file = JSON.parse($file.read(FILE).string)
  file.workspace = workspace
  $file.write({
    data: $data({ string: JSON.stringify(file) }),
    path: FILE
  })
}


function setDefaultSettings() {
  let previewData = JSON.parse($file.read(FILE).string)
  for (let idx in settingKeys) {
    if (typeof previewData[settingKeys[idx]] === 'undefined' || previewData[settingKeys[idx]] == "") {
      let defaultValue = ' '
      if ($file.exists(`defaultConf/${settingKeys[idx]}`)) {
        defaultValue = $file.read(`defaultConf/${settingKeys[idx]}`).string
      }
      previewData[settingKeys[idx]] = defaultValue
    }
  }
  $file.write({
    data: $data({ "string": JSON.stringify(previewData) }),
    path: FILE
  })
}

function autoGen() {
  $ui.render({
    props: {
      title: ""
    },
    layout: $layout.fill,
    views: [{
      type: "blur",
      props: {
        id: "progressView",
        style: 1
      },
      layout: $layout.fill,
      views: [{
        type: "label",
        props: {
          id: "loadingHintLabel",
          text: "处理中，请稍后",
          textColor: $color("black"),
        },
        layout: (make, view) => {
          make.centerX.equalTo(view.super)
          make.centerY.equalTo(view.super).offset(-30)
        }
      }, {
        type: "progress",
        props: {
          id: "progressBar",
          value: 0
        },
        layout: (make, view) => {
          make.width.equalTo(screenWidth * 0.8)
          make.center.equalTo(view.super)
          make.height.equalTo(3)
        }
      }, {
        type: "button",
        props: {
          title: "CLOSE"
        },
        layout: (make, view) => {
          make.width.equalTo(80)
          make.top.equalTo(view.prev.bottom).offset(20)
          make.centerX.equalTo(view.super)
        },
        events: {
          tapped: sender => {
            $http.stopServer()
            $app.close()
          }
        }
      }]
    }]
  })
  $app.listen({
    ready: function () {
      makeConf({
        onProgress: (p, hint) => {
          hint !== '' && ($("loadingHintLabel").text = hint)
          $("progressBar").value = p
        },
        onDone: res => {
          exportConf(res.fileName, res.fileData, res.target, res.actionSheet, true, () => {
            $http.stopServer()
            $app.close()
          })
        },
        onError: res => {
          $ui.alert("无法生成配置文件，可能是规则仓库发生变化或网络出现问题")
        }
      })
    }
  })
}

function makeConf(params) {
  'onStart' in params && params.onStart()
  try {
    let pu = {
      prototype: "https://raw.githubusercontent.com/lhie1/Rules/master/Surge/Prototype.conf",
      apple: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/Apple.conf',
      direct: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/DIRECT.conf',
      proxy: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/PROXY.conf',
      reject: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/REJECT.conf',
      testflight: 'https://raw.githubusercontent.com/lhie1/Rules/master/Surge/TestFlight.conf',
      host: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/HOST.conf',
      urlrewrite: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/URL%20Rewrite.conf',
      urlreject: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/URL%20REJECT.conf',
      headerrewrite: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/Header%20Rewrite.conf',
      hostname: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/Hostname.conf',
      mitm: 'https://raw.githubusercontent.com/lhie1/Rules/master/Surge/MITM.conf',
      quanretcp: 'https://raw.githubusercontent.com/lhie1/Rules/master/Quantumult/Quantumult.conf',
      quanextra: 'https://raw.githubusercontent.com/lhie1/Rules/master/Quantumult/Quantumult_Extra_JS.conf',
      quanrejection: 'https://raw.githubusercontent.com/lhie1/Rules/master/Quantumult/Quantumult_URL.conf',
      localhost: 'http://127.0.0.1/fndroid'
    }
    let advanceSettings = JSON.parse($file.read(FILE).string)
    let workspace = advanceSettings.workspace
    let usualData = workspace.usualData
    let customProxyGroup = workspace.customProxyGroup

    let usualValue = function (key) {
      return usualData.find(i => i.title.text == key) ? usualData.find(i => i.title.text == key).title.bgcolor : false
    }

    let ads = usualValue('ADS')
    let isMitm = usualValue('MITM')
    let isActionSheet = usualValue('导出')

    let outputFormat = workspace.outputFormat
    let surge2 = outputFormat === 'Surge 2'
    let isQuan = outputFormat === 'Quantumult'
    let testflight = outputFormat === 'Surge 3 TF'

    let serverEditorData = workspace.serverData
    if (isQuan) {
      serverEditorData = serverEditorData.map(i => {
        let rows = i.rows.map(s => {
          let containsOP = /obfs_param/.test(s.proxyLink)
          s.proxyLink = s.proxyLink.replace(/,\s*group\s*=[^,]*/, '')
          if (containsOP) {
            s.proxyLink = s.proxyLink.replace(/obfs_param/, `group=${i.title}, obfs_param`)
          } else {
            s.proxyLink += `, group=${i.title}`
          }
          return s
        })
        i.rows = rows
        return i
      })
    }
    let flatServerData = serverEditorData.reduce((all, cur) => {
      return {
        rows: all.rows.concat(cur.rows)
      }
    }, { rows: [] }).rows

    let proxyNameLegal = function (name) {
      return flatServerData.map(i => i.proxyName.text).concat(getProxyGroups()).concat(['🚀 Direct']).find(i => i === name) !== undefined
    }

    let proxySuffix = workspace.serverSuffix.split(/\s*,\s*/g).map(i => i.replace(/\s/g, '')).filter(i => i !== '')
    let proxies = flatServerData.map(i => {
      let notExistSuffix = proxySuffix.filter((ps, idx) => {
        if (idx === 0 && ps === '') return true
        return i.proxyLink.indexOf(ps) < 0
      })
      let containsOP = /obfs_param/.test(i.proxyLink)
      if (containsOP) {
        i.proxyLink = i.proxyLink.replace(/obfs_param/, `${notExistSuffix.join(',')},obfs_param`)
      } else if (notExistSuffix.length > 0) {
        i.proxyLink += `,${notExistSuffix.join(',')}`
      }
      return i.proxyLink.replace('http://omgib13x8.bkt.clouddn.com/SSEncrypt.module', 'https://github.com/lhie1/Rules/blob/master/SSEncrypt.module?raw=true')
    }).filter((item, idx, self) => {
      let proxyName = item.split(/=/)[0].trim()
      return self.findIndex(i => {
        let pn = i.split('=')[0].trim()
        return proxyName === pn
      }) === idx
    })
    proxies = proxies.join('\n')
    let proxyHeaders = flatServerData.map(i => i.proxyName.text).join(', ')
    let rules = ''
    let prototype = ''
    let host = ''
    let urlRewrite = ''
    let urlReject = ''
    let headerRewrite = ''
    let hostName = ''
    let rename = null
    let rulesReplacement = getRulesReplacement()

    let pgs = 0

    let onPgs = function (hint) {
      pgs += 0.1
      'onProgress' in params && params.onProgress(pgs, hint)
    }

    let emptyPromise = function (done, hint = '') {
      if (done) done(hint)
      return Promise.resolve('')
    }

    let promiseArray = [
      getAutoRules(pu.prototype, onPgs, '成功取回配置模板'), // 0
      rulesReplacement ? getAutoRules(rulesReplacement, onPgs, '成功取回替换配置') : getAutoRules(isQuan || testflight ? pu.direct : pu.apple, onPgs, '成功取回APPLE规则'), // 1
      !ads || rulesReplacement ? emptyPromise(onPgs) : getAutoRules(isQuan || testflight ? pu.localhost : pu.reject, onPgs, '成功取回Reject规则'),  // 2
      rulesReplacement ? emptyPromise(onPgs) : getAutoRules(isQuan || testflight ? pu.quanretcp : pu.proxy, onPgs, '成功取回Proxy规则'), // 3
      rulesReplacement ? emptyPromise(onPgs) : getAutoRules(isQuan || testflight ? pu.quanextra : pu.direct, onPgs, '成功取回Direct规则'), // 4
      rulesReplacement ? emptyPromise(onPgs) : getAutoRules(pu.host, onPgs, '成功取回Host'), // 5
      rulesReplacement ? emptyPromise(onPgs) : getAutoRules(pu.urlrewrite, onPgs, '成功取回URL Rewrite'), // 6
      !ads || rulesReplacement ? emptyPromise(onPgs) : getAutoRules(isQuan ? pu.quanrejection : pu.urlreject, onPgs, '成功取回URL Reject'), // 7
      rulesReplacement ? emptyPromise(onPgs) : getAutoRules(pu.headerrewrite, onPgs, '成功取回Header Rewrite'), // 8
      !ads || rulesReplacement ? emptyPromise(onPgs) : getAutoRules(pu.hostname, onPgs, '成功取回MITM Hostname'), // 9
    ]

    Promise.all(promiseArray).then(v => {
      prototype = v[0]
      if (rulesReplacement) {
        let repRules = v[1].match(filePartReg('Rule'))
        let repHost = v[1].match(filePartReg('Host'))
        let repUrlRewrite = v[1].match(filePartReg('URL Rewrite'))
        let repHeaderRewrite = v[1].match(filePartReg('Header Rewrite'))
        let repHostName = v[1].match(/hostname\s*=\s*(.*?)[\n\r]/)
        repRules && repRules[1] && (v[1] = repRules[1])
        repHost && repHost[1] && (v[5] = repHost[1])
        repUrlRewrite && repUrlRewrite[1] && (v[6] = '[URL Rewrite]\n' + repUrlRewrite[1])
        repHeaderRewrite && repHeaderRewrite[1] && (v[8] = '[Header Rewrite]\n' + repHeaderRewrite[1])
        repHostName && repHostName[1] && (v[9] = repHostName[1])
      }

      if (isQuan && /\[TCP\]([\s\S]*)\/\/ Detect local network/.test(v[3])) {
        let tcpRules = `${v[4]}\n${RegExp.$1}`.split(/[\n\r]+/g)
        if (!ads) {
          tcpRules = tcpRules.filter(i => !/^.*?,\s*REJECT\s*$/.test(i))
        }
        let surgeLan = v[1].split(/[\r\n]/g).filter(i => /.*?,\s*DIRECT/.test(i))
        tcpRules = tcpRules.map(r => {
          if (surgeLan.indexOf(r) > -1) return r
          r = r.replace(/(^.*?,.*?,\s*)选择YouTube Music的策略(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择TVB\/Viu的策略(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择Vidol的策略(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择Hulu的策略(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择Spotify的策略(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择Google的策略，不懂就不选(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择微软服务的策略，不懂就选择DIRECT(.*$)/, '$1🍂 Domestic$2')
          r = r.replace(/(^.*?,.*?,\s*)选择PayPal的策略，不懂就选择DIRECT(.*$)/, '$1🍂 Domestic$2')
          r = r.replace(/(^.*?,.*?,\s*)选择Apple的策略，不懂就选择DIRECT(.*$)/, '$1🍎 Only$2')
          r = r.replace(/(^.*?,.*?,\s*)选择Netflix的策略，不懂就不选(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)选择国外流媒体的策略(.*$)/, '$1🍃 Proxy$2')
          r = r.replace(/(^.*?,.*?,\s*)DIRECT(.*$)/i, '$1🍂 Domestic$2')
          r = r.replace(/(^.*?,.*?,\s*)PROXY(.*$)/i, '$1🍃 Proxy$2')
          r = r.replace(/^DOMAIN(.*?)🍃 Proxy\s*$/, 'DOMAIN$1🍃 Proxy,force-remote-dns')
          return r
        })
        v[1] = tcpRules.join('\n')
        v[2] = ''
        v[3] = ''
        v[4] = ''
        v[7] = v[7].replace(/hostname = /, '# hostname = ')
      }

      if (testflight) {
        let autoNewPrefix = 'https://raw.githubusercontent.com/lhie1/Rules/master/Surge3'
        let timestamp = `?t=${new Date().getTime()}`
        v[1] = `RULE-SET,SYSTEM,DIRECT\nRULE-SET,${autoNewPrefix}/apple.list${timestamp},🍎 Only`
        v[2] = ads ? `RULE-SET,${autoNewPrefix}/reject.list${timestamp},REJECT` : ''
        v[3] = `RULE-SET,${autoNewPrefix}/china_media.list${timestamp},🍂 Domestic\nRULE-SET,${autoNewPrefix}/global_media.list${timestamp},🎵 Global Media\nRULE-SET,${autoNewPrefix}/proxy.list${timestamp},🍃 Proxy`
        v[4] = `RULE-SET,${autoNewPrefix}/domestic.list${timestamp},🍂 Domestic\nRULE-SET,LAN,DIRECT`
      }

      rules += `\n${v[1]}\n${v[2].replace(/REJECT/g, surge2 || isQuan ? "REJECT" : "REJECT-TINYGIF")}\n${v[3]}\n${v[4]}\n`
      host = v[5]
      urlRewrite += v[6]
      urlReject += v[7]
      headerRewrite = v[8]
      hostName = v[9].split('\n')

      let seperateLines = function (content) {
        return {
          add: content.split('\n').filter(i => !/^-/.test(i)).map(i => i.trim()),
          delete: content.split("\n").filter(i => /^-/.test(i)).map(i => i.replace(/^-/, '').trim())
        }
      }

      let prettyInsert = function (lines) {
        return '\n\n' + lines.join('\n') + '\n\n'
      }

      // 配置代理分组
      if (advanceSettings.proxyGroupSettings) {
        let pgs = advanceSettings.proxyGroupSettings
        rename = pgs.match(/\/\/\s*rename\s*:\s*(.*?)(?:\n|\r|$)/)
        pgs = pgs.replace(/Proxy Header/g, proxyHeaders)
        for (let name in customProxyGroup) {
          let nameReg = new RegExp(`,\\s*${name}`, 'g')
          let serverNames = customProxyGroup[name]
          serverNames = serverNames.filter(i => proxyNameLegal(i))
          pgs = pgs.replace(nameReg, ',' + (serverNames.join(',') || flatServerData.map(i => i.proxyName.text).join(',')))
        }
        prototype = prototype.replace(/\[Proxy Group\][\s\S]+\[Rule\]/, pgs + '\n\n[Rule]')
      } else {
        prototype = prototype.replace(/Proxy Header/g, proxyHeaders)
        prototype = prototype.replace(/ProxyHeader/g, customProxyGroup[PROXY_HEADER].filter(i => proxyNameLegal(i)).join(',') || flatServerData.map(i => i.proxyName.text).join(','))
      }
      // 配置常规设置
      if (advanceSettings.generalSettings) {
        prototype = prototype.replace(/\[General\][\s\S]+\[Proxy\]/, advanceSettings.generalSettings + '\n\n[Proxy]')
      }
      // 配置自定义规则
      let customRules = seperateLines(advanceSettings.customSettings)
      customRules.add = customRules.add.map(i => {
        if (/RULE-SET\s*,\s*(http.*?\.list)\s*,(.*?)$/.test(i)) {
          return `RULE-SET, ${RegExp.$1}?t=${new Date().getTime()}, ${RegExp.$2}`
        }
        return i
      })
      customRules.delete.forEach(i => rules = rules.replace(i, ''))
      // 配置本地DNS映射
      let userHost = seperateLines(advanceSettings.hostSettings)
      userHost.delete.forEach(i => host = host.replace(i, ''))
      // 配置URL重定向
      let userUrl = seperateLines(advanceSettings.urlrewriteSettings)
      userUrl.delete.forEach(i => {
        urlRewrite = urlRewrite.replace(i, '')
        urlReject = urlReject.replace(i, '')
      })
      // 配置Header修改
      let userHeader = seperateLines(advanceSettings.headerrewriteSettings)
      userHeader.delete.forEach(i => headerRewrite = headerRewrite.replace(i, ''))
      // 配置SSID
      let userSSID = advanceSettings.ssidSettings
      // 配置MITM的Hostname
      let userHostname = seperateLines(advanceSettings.hostnameSettings)
      userHostname.delete.forEach(i => {
        if (hostName.indexOf(i) >= 0) {
          hostName.splice(hostName.indexOf(i), 1)
        }
      })

      // 视频代理处理
      let videoProxy = workspace.videoProxy
      let videoReg = require('scripts/videoReg')
      for (let videoType in videoProxy) {
        let proxyName = videoProxy[videoType]
        if (!proxyNameLegal(proxyName)) continue
        (rules.match(videoReg[videoType]) || []).forEach(i => {
          if (/(^.*?,.*?,)[^,]*(.*$)/.test(i)) {
            rules = rules.replace(i, `${RegExp.$1}${proxyName}${RegExp.$2}`)
          }
        })
      }

      function ssr2ss(proxies) {
        let proxyList = proxies.split(/\n/);
        let res = proxyList.map(proxy => {
          if (/=\s*shadowsocksr/.test(proxy)) {
            return proxy.replace(/=\s*shadowsocksr/g, '= custom').replace(/"/g, '').replace(/,\s*(protocol|protocol_param|obfs|obfs_param)[^,$]+/g, '') + ', https://github.com/lhie1/Rules/blob/master/SSEncrypt.module?raw=true'
          } else {
            return proxy
          }
        })
        return res.join('\n')
      }

      if (isQuan) {
        prototype = prototype.replace(/\/\/ Detect local network/, `${prettyInsert(customRules.add)}\n`)
      } else {
        prototype = prototype.replace('# Custom', prettyInsert(customRules.add))
      }
      prototype = prototype.replace('Proxys', isQuan ? proxies : ssr2ss(proxies))
      if (rulesReplacement) {
        prototype = prototype.replace(/\[Rule\][\s\S]*FINAL\s*,[^\r\n]+/, `[Rule]\n${prettyInsert(customRules.add)}\n${rules}\n`)
      } else {
        prototype = prototype.replace('# All Rules', rules)
      }
      prototype = prototype.replace('# Host', "[Host]\n" + host + prettyInsert(userHost.add))
      prototype = prototype.replace('# URL Rewrite', urlRewrite.replace(/307/g, surge2 ? '302' : '307') + prettyInsert(userUrl.add))
      prototype = prototype.replace('# URL REJECT', urlReject)
      prototype = prototype.replace('# SSID', '[SSID Setting]\n' + userSSID)
      prototype = prototype.replace('# Header Rewrite', headerRewrite + prettyInsert(userHeader.add))
      let finalHostNames = hostName.concat(userHostname.add.filter(i => i != '')).join(', ')
      if (finalHostNames !== '') {
        prototype = prototype.replace('// Hostname', 'hostname = ' + finalHostNames)
      }

      if (isMitm) {
        prototype = prototype.replace('# MITM', advanceSettings.mitmSettings)
      } else {
        prototype = prototype.replace(/\[MITM\][\s\S]*$/, '')
      }

      function genQuanPolices(content) {
        let items = content.split(/[\n\r]+/).filter(i => i !== '' && !/^\/\//.test(i)).map(sta => {
          let matcher = sta.match(/^(.*?)=(.*?),(.*?)$/);
          if (/^(.*?)=(.*?),(.*?)$/.test(sta)) {
            let pName = RegExp.$1
            let pType = RegExp.$2
            let pNodes = RegExp.$3
            let data = pNodes.split(/,/g)
            if (/url-test/.test(pType) || /fallback/.test(pType)) {
              let v = data.filter(i => !/(?:url|interval|tolerance|timeout)\s*=\s*/.test(i))
              return {
                name: pName,
                sta: ' auto',
                data: v
              }
            } else if (/select/.test(pType)) {
              return {
                name: pName,
                sta: pType.replace(/select/, 'static'),
                data: data
              }
            } else if (/round-robin/.test(pType)) {
              return {
                name: pName,
                sta: 'balance, round-robin',
                data: data
              }
            } else {
              return {
                name: pName,
                sta: 'ssid',
                data: data
              }
            }
          } else {
            return null
          }
        }).filter(i => i !== null)
        items.push({
          name: '🚀 Direct',
          sta: 'static',
          data: ["DIRECT"]
        })
        let policies = items.map(i => {
          if (i.sta.contains('auto') || i.sta.contains('balance, round-robin')) {
            return `${i.name} : ${i.sta}\n${i.data.join('\n')}`
          } else if (i.sta.contains('static')) {
            return `${i.name} : ${i.sta}, ${i.data[0]}\n${i.data.join('\n')}`
          } else if (i.sta === 'ssid') {
            let wifi = i.data.find(i => /default\s*=/.test(i))
            let cellular = i.data.find(i => /cellular\s*=/.test(i)) || 'cellular = DIRECT'
            let left = i.data.filter(i => i !== wifi && i !== cellular).map(i => {
              let p = i.split('=')
              return p[0].replace(/"/g, '') + '=' + p.slice(1).join('=')
            })
            return `${i.name} : ${wifi.replace(/default\s*=/, 'wifi =')}, ${cellular}\n${left.join('\n')}`
          }
        })
        return policies.map(i => {
          if (rename && rename[1]) {
            i = globalRename(rename, i) // 圈特殊性
          }
          return $text.base64Encode(i)
        })
      }

      function genQuanRewrite(content) {
        let items = content.split(/[\n\r]+/).filter(i => i !== '' && /^(?!\/\/|#)/.test(i)).map(i => {
          if (/^(.*?)\s+(.*?)\s+(.*?)\s*$/.test(i)) {
            let type = RegExp.$3
            return `${RegExp.$1} url ${type === 'header' ? 'modify' : type} ${RegExp.$2}`
          }
          return ''
        }).join('\n')
        return items
      }

      function genQuanRewriteTinyPng(reject, rewrite) {
        let rejects = reject.split(/[\n\r]/g).filter(i => /.*?\s*-\s*reject/.test(i)).map(i => i.replace(/(.*?)\s*-\s*reject\s*$/, '$1'))
        let items = rejects.map(i => `${i} url simple-response SFRUUC8xLjEgMjAwIE9LDQpTZXJ2ZXI6IG5naW54DQpDb250ZW50LVR5cGU6IGltYWdlL3BuZw0KQ29udGVudC1MZW5ndGg6IDU2DQpDb25uZWN0aW9uOiBjbG9zZQ0KDQqJUE5HDQoaCgAAAA1JSERSAAAAAQAAAAEIBgAAAB8VxIkAAAALSURBVHicY2AAAgAABQABel6rPw==`)
        items = items.concat(rewrite.split(/[\n\r]+/).filter(i => i !== '' && /^(?!\/\/|#)/.test(i)).map(i => {
          if (/^(.*?)\s+(.*?)\s+(.*?)\s*$/.test(i)) {
            let type = RegExp.$3
            return `${RegExp.$1} url ${type === 'header' ? 'modify' : type} ${RegExp.$2}`
          }
          return ''
        }))
        return items.join('\n')
      }

      function genQuanPart(name, content) {
        return `\n[${name}]\n${content}\n`
      }

      if (isQuan) {
        prototype = prototype.replace(/☁️ Others, dns-failed/, '☁️ Others')
        let proxyGroup = prototype.match(filePartReg('Proxy Group'))
        if (proxyGroup && proxyGroup[1]) {
          let policies = genQuanPolices(proxyGroup[1])
          prototype += genQuanPart('POLICY', policies.join('\n'))
        }
        userUrl.add.forEach(i => {
          if (/reject\s*$/.test(i)) {
            urlReject += `\n${i}\n`
          } else {
            urlRewrite += `\n${i}\n`
          }
        })
        // prototype += genQuanPart('URL-REJECTION', urlReject)
        // prototype += genQuanPart('REWRITE', genQuanRewrite(urlRewrite))
        prototype += genQuanPart('REWRITE', genQuanRewriteTinyPng(urlReject, urlRewrite))
        prototype += genQuanPart('HOST', host + prettyInsert(userHost.add))
        let sourceType = 'false, true, false';
        let sourceTypeParam = proxySuffix.find(x => /\s*source-type\s*=\s*[0-7]\s*(?:,|$)/.test(x))
        if (sourceTypeParam) {
          let type = sourceTypeParam.match(/\s*source-type\s*=\s*([0-7])/)[1] * 1;
          sourceType = `${type & 4 ? 'true' : 'false'}, ${type & 2 ? 'true' : 'false'}, ${type & 1 ? 'true' : 'false'}`
        }
        console.log(serverEditorData)
        prototype += genQuanPart('SOURCE', serverEditorData.filter(i => {
          // let isSSR = i.rows.find(l => /^.*?=\s*(?=shadowsocksr|vmess)/.test(l.proxyLink))
          // return isSSR !== undefined
          return i.rows.find(i => i.proxyType > 0)
        }).map(i => {
          return `${i.title}, server, ${i.url}, ${sourceType}, ${i.title}`
        }).join('\n') + (rulesReplacement ? "" : "\nlhie1, filter, https://raw.githubusercontent.com/lhie1/Rules/master/Quantumult/Quantumult.conf, true\nlhie1_extra, filter, https://raw.githubusercontent.com/lhie1/Rules/master/Quantumult/Quantumult_Extra.conf, true\nlhie1, blacklist, https://raw.githubusercontent.com/lhie1/Rules/master/Quantumult/Quantumult_URL.conf, true\n"))
        let customDNS = prototype.match(/dns-server\s*=\s*(.*?)(?:\n|\r|$)/)
        if (customDNS && customDNS[1]) {
          prototype += genQuanPart('DNS', customDNS[1])
        }
        let widgetProxies = customProxyGroup['WidgetHeader'] || null
        if (widgetProxies) {
          widgetProxies = widgetProxies.filter(i => proxyNameLegal(i))
          prototype += genQuanPart('BACKUP-SERVER', widgetProxies.join('\n'))
        }
        prototype = prototype.replace(/\[SSID Setting\]/, "[SUSPEND-SSID]").replace(/\ssuspend=true/g, '')
      }

      if (rename && rename[1]) {
        prototype = globalRename(rename, prototype);
      }

      let fn = (workspace.fileName || 'lhie1') + '.conf'

      let exportTarget = 0

      if (surge2) {
        exportTarget = 1
      }

      if (isQuan) {
        exportTarget = 2
      }

      if ('onDone' in params) {
        ruleUpdateUtil.getGitHubFilesSha({
          handler: sha => {
            if (sha) {
              ruleUpdateUtil.setFilesSha(sha)
            }
            params.onDone({
              target: exportTarget,
              actionSheet: isActionSheet,
              fileName: fn,
              fileData: prototype
            })
          }
        })
      }
    }).catch(e => {
      console.error(e.stack)
    })
  } catch (e) {
    console.error(e.stack)
    'onError' in params && params.onError(e)
  }

  function globalRename(rename, prototype) {
    let renamePat = rename[1].split(/\s*,\s*/g).filter(i => i.indexOf('=') > -1).map(i => {
      let sp = i.reverse().split(/\s*=(?!\\)\s*/g);
      return sp.map(i => i.reverse().trim()).reverse();
    });
    renamePat.forEach(i => {
      let oldName = i[0];
      let newName = i[1].replace(/\\=/g, '=');
      let oldNameReg = new RegExp(oldName, 'g');
      prototype = prototype.replace(oldNameReg, newName);
    });
    return prototype;
  }
}

function getRulesReplacement(content = '') {
  let advanceSettings = content ? content : JSON.parse($file.read(FILE).string)
  if (advanceSettings.customSettings) {
    let cs = advanceSettings.customSettings;
    let pat = cs.match(/\/\/\s*replacement\s*:\s*(.*?)(?:\n|\r|$)/);
    if (pat && pat[1]) {
      return pat[1];
    }
  }
  return null;
}

function exportConf(fileName, fileData, exportTarget, actionSheet, isAuto, actionSheetCancel) {
  let surge3 = exportTarget === 0
  let surge2 = exportTarget === 1
  let isQuan = exportTarget === 2
  if (surge2 || surge3) {
    let fnReg = /^[\x21-\x2A\x2C-\x2E\x30-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7B\x7D-\x7E]+$/
    if (actionSheet || !fnReg.test(fileName)) {
      $share.sheet({
        items: [fileName, $data({ "string": fileData })],
        handler: success => {
          if (!success && actionSheetCancel) {
            actionSheetCancel()
          }
        }
      })
    } else {
      if (!$file.exists("confs")) {
        $file.mkdir("confs")
      } else {
        $file.list('confs').forEach(i => $file.delete('confs/' + i))
      }
      $file.write({
        data: $data({ "string": fileData }),
        path: `confs/${fileName}`
      })
      $http.startServer({
        path: "confs/",
        handler: res => {
          let serverUrl = `http://127.0.0.1:${res.port}/`
          $http.get({
            url: serverUrl + "list?path=",
            handler: function (resp) {
              if (resp.response.statusCode == 200) {
                let surgeScheme = `surge${surge2 ? "" : "3"}:///install-config?url=${encodeURIComponent(serverUrl + "download?path=" + fileName)}`
                $app.openURL(surgeScheme)
                $delay(10, () => {
                  $http.stopServer()
                  if (isAuto) {
                    $app.close()
                  }
                })
              } else {
                $ui.alert("内置服务器启动失败，请重试")
              }
            }
          })
        }
      })
    }
  } else if (isQuan) {
    if (actionSheet) {
      $share.sheet({
        items: [fileName, $data({ "string": fileData })],
        handler: success => {
          if (!success && actionSheetCancel) {
            actionSheetCancel()
          }
        }
      })
    } else {
      $clipboard.text = fileData
      $app.openURL("quantumult://settings?configuration=clipboard&autoclear=1")
    }
  }

  function genServerFiles(name, data) {
    $file.write({
      data: $data({ "string": data }),
      path: `confs/${name}`
    });
  }
}

function urlsaveBase64Encode(url) {
  return $text.base64Encode(url).replace(/\+/g, '-').replace(/\\/g, '_').replace(/=/g, '')
}

module.exports = {
  renderUI: renderUI,
  setUpWorkspace: setUpWorkspace,
  autoGen: autoGen,
  getRulesReplacement: getRulesReplacement
}
