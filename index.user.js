// ==UserScript==
// @name         bnude
// @namespace    http://www.bnude.cn/
// @updateURL    https://github.com/e26F626/bnude-utils/raw/master/static/install.user.js
// @downloadURL  https://github.com/e26F626/bnude-utils/raw/master/static/install.user.js
// @version      0.1
// @description  北师大在线学习辅导工具
// @author       未知地域
// @match        http://www.bnude.cn/elms/index.jsp*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  "use strict";

  console.log(123);
  const util = {};

  const findParent = setInterval(() => {
    document.querySelectorAll("frame").forEach(v => {
      if (v.src.startsWith("http://www.bnude.cn/elms/head.jsp")) {
        clearInterval(findParent);
        start(v);
      }
      if (v.src.startsWith("http://www.bnude.cn/elms/studyonline/index.jsp")) {
        clearInterval(findParent);
        util.win = v;
      }
    });
  }, 100);

  function start(v) {
    let b = v.contentWindow.document.createElement("button");
    b.style.position = "absolute";
    b.id = "anfoiashdfklnaskljdfhukasdhflkmn23ugfaskdn";
    b.style.top = "0";
    b.style.left = "0";
    b.textContent = "学习页面上的所有课件";
    b.onclick = () => {
      console.log(2);

      util.__find(util.win);
    };
    v.contentWindow.onload = function() {
      v.contentWindow.document.body.appendChild(b);
      //   b.onclick = util.__find.bind(null, v);
    };

    setInterval(() => {
      const id = v.contentWindow.document.querySelector(
        "#anfoiashdfklnaskljdfhukasdhflkmn23ugfaskdn"
      );
      if (!id) {
        b = b.cloneNode(true);
        v.contentWindow.document.body.appendChild(b);
        b.onclick = () => {
          console.log(2);

          util.__find(util.win);
        };
        // v.contentWindow.document.addEventListener("click", function(e) {
        //   if (e.target.id === "anfoiashdfklnaskljdfhukasdhflkmn23ugfaskdn") {
        //     console.log(123123);
        //   }
        // });
      }
    }, 100);
  }

  util.__find = function find(v) {
    console.log("开始查找页面上的课件");
    function s1(v) {
      const s1Win = v.contentWindow;
      const iframe = s1Win.document.querySelectorAll("iframe");
      if (iframe) {
        const _1 = "http://www.bnude.cn/elms/tools/announcement/index.jsp";
        iframe.forEach(ifr => {
          if (ifr.src.startsWith(_1)) {
            s2(ifr);
            return false;
          } else {
            console.error("iframe框架地址不匹配", iframe);
          }
        });
      } else {
        console.error("没有找到iframe框架");
      }
    }

    function s2(iframe) {
      console.log("查找课件");
      const win = iframe.contentWindow;
      const tdList = win.document.querySelectorAll(
        "table.tablemain>tbody>tr>td:nth-child(3)"
      );
      if (tdList && tdList.length > 0) {
        const all = [];
        tdList.forEach(td => {
          if (td.textContent.trim() === "课件") {
            all.push(td.parentNode);
          }
        });
        if (all.length === 0) {
          alert("没有找到课件");
        } else {
          console.log(all);
          all.forEach(tr => studyTr(tr));
        }
      } else {
        console.error("没有找到课件列表");
      }
    }

    function studyTr(tr) {
      const name = tr.children[0].textContent.trim();
      const href = tr.children[0].querySelector("a").href;
      const win = tr.ownerDocument.defaultView;
      tr.children[4].textContent = "正在准备...";
      let sc = 0;
      win.open = url => {
        fetch("http://www.bnude.cn/elms/content/course/" + url)
          .then(res => res.text())
          .then(text => {
            const result = text.match(
              /frame id="topFrame" name="topFrame" src="([^"]+)"/
            );
            if (result) {
              let url = result[1];
              if (url.startsWith("./")) url = url.substr(1);
              url = "http://www.bnude.cn/elms/content/course/" + url;
              fetch(url)
                .then(res => res.text())
                .then(text => {
                  const k_url_res = text.match(/var k_url = "([^"]+)"/);
                  if (k_url_res) {
                    const k_url =
                      "http://www.bnude.cn/elms/content/course/" + k_url_res[1];
                    tr.children[4].style.color = "red";
                    const timeout = 600;
                    const s = setInterval(() => {
                      tr.children[4].textContent = "正在学习 " + sc + "秒";
                      if (++sc % timeout === 0) {
                        let strurl = k_url + sc;
                        win.$.ajax({
                          url: strurl,
                          type: "POST",
                          data: "json",
                          async: false,
                          success: function() {
                            console.log("保存课件", name, "当前保存时间", sc);
                            let strurl =
                              "/elms/tools/announcement/my_announcement.jsp?type=1&courseID=702";
                            win.$.ajax({
                              url: strurl,
                              type: "POST",
                              data: "json",
                              async: false,
                              success: function(Data) {
                                sc = -1;
                                clearInterval(s);
                                console.log("保存时间");
                                tr.children[4].textContent =
                                  "学习完成，总时长" + timeout + "秒";
                              }
                            });
                          }
                        });
                      }
                    }, 888);
                  } else {
                    console.error("获取保存课件时间链接失败！");
                  }
                });
            } else {
              console.error("获取课件链接失败！");
            }
          });
      };
      eval("win." + href.substr(11));
    }

    s1(v);
  };
})();
