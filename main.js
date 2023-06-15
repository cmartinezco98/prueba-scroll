let $sections,
  lastScrollTop = 0;

const d = document,
  w = window;

let execution = true,
  height = 0,
  previousHeight = 0,
  idCurrentSection;

document.addEventListener("DOMContentLoaded", (e) => {
  e.preventDefault();

  let loader = document.getElementById("loaderPage");
  $sections = document.querySelectorAll("[data-scrollSmooth]");

  const cb = (entries) => {
    entries.forEach((entry) => {
      let id = entry.target.getAttribute("id");

      if (entry.isIntersecting) {
        console.log("Se encuentra en section", id);
        height = entry.target.offsetHeight;
        idCurrentSection = id;

        const array = [...$sections];
        const $section = $sections.item(
          array.findIndex((el) => el.id === idCurrentSection) - 1
        );
        previousHeight = $section.offsetHeight;
      }
    });
  };

  const observer = new IntersectionObserver(cb, { threshold: [0.75, 1.0] });
  $sections.forEach((el) => observer.observe(el));

  setTimeout(() => {
    new WOW().init();
    hoverImageNosotrOZ();

    loader.style.visibility = "hidden";
    loader.style.opacity = "0";
  }, 1000);

  new Splide(".splide", {
    autoplay: true,
    interval: 4000,
    type: "loop",
    lazyLoad: true,
    intersection: {
      inView: {
        autoplay: true,
      },
      outView: {
        autoplay: true,
      },
    },
    classes: {
      arrow: "splide__arrow splide_arrow_banners",
    },
  }).mount();

  new Splide(".splide-projects", {
    type: "loop",
    lazyLoad: true,
    classes: {
      arrow: "splide__arrow splide_arrow_projects",
    },
  }).mount();

  new Splide(".splide-nosotroz", {
    type: "loop",
    lazyLoad: true,
    classes: {
      arrow: "splide__arrow splide_arrow_nosotroz",
    },
  }).mount();

  new Splide(".splide-clientes", {
    type: "loop",
    lazyLoad: true,
    classes: {
      arrow: "splide__arrow splide_arrow ",
    },
  }).mount();

  formSubmit();
});

window.addEventListener("wheel", (e) => {
  if (execution) {
    if (Math.sign(e.deltaY) === 1) {
      //abajo

      window.scroll({ top: w.scrollY + height });
    } else {
      //arriba
      console.log($section);
      window.scroll({ top: w.scrollY - previousHeight });
    }
    setTimeout(() => {
      execution = true;
    }, 1200);
  }
  execution = false;

  // $sections.forEach((sec) => {
  //   let top = w.scrollY,
  //     offset = sec.offsetTop,
  //     height = sec.offsetHeight,
  //     id = sec.getAttribute("id");
  //   if (top - offset >= offset && top - offset < offset + height) {
  //     console.log("Top"+top+" Offset"+offset);
  //     console.log("Offset Height"+(offset + height));
  //     console.log("Se encuentra en " + id);
  //     console.log("Altura del elemento HTML"+sec.clientHeight);
  //     console.log("Scroll to");
  //     w.scrollTo({top:74-height});
  //   }
  // });

  //window.scrollTo({ top: 721 });

  // let st = window.pageYOffset || document.documentElement.scrollTop;
  // if (st > lastScrollTop) {
  //    abajo
  //    window.location.href = "http://localhost/oz-digital/#proyectos";
  //    if(lastScrollTop === 0){

  //       window.scrollTo({ top: 721 });
  //    }
  //    console.log("abajo");
  // } else {
  //    arriba
  //    console.log("abajo");
  //    w.scrollTo({top:0});
  // }
  // console.log("Last Scroll", lastScrollTop);
  // console.log("actual ScrollTop", st);
  // lastScrollTop = st;
});

const smoothScroll = () => {
  console.log($sections);
  console.log("hola");
};

const hoverImageNosotrOZ = () => {
  let splideNosotroz = document.querySelector(".splide-nosotroz");
  let images = splideNosotroz.querySelectorAll("img.img-nosotroz");
  for (const image of images) {
    let name = image.dataset.name;

    image.addEventListener("mouseover", (e) => {
      e.preventDefault();
      image.src = `assets/img/fotos/${name}-informacion.png`;
    });

    image.addEventListener("mouseout", (e) => {
      e.preventDefault();
      image.src = `assets/img/fotos/${name}.png`;
    });
  }
};

const formSubmit = () => {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let btnSubmit = form.querySelector("#btnSubmit");
      let spinnerForm = btnSubmit.querySelector(".spinner-border");

      spinnerForm.classList.remove("d-none");
      btnSubmit.setAttribute("disabled", true);

      form.classList.add("was-validated");

      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();

        spinnerForm.classList.add("d-none");
        btnSubmit.removeAttribute("disabled");
      } else {
        let currentDate = new Date();
        let dataForm = new FormData(form);

        dataForm.append("action", "insertContact");
        dataForm.append(
          "date",
          `${currentDate.getFullYear()}-${
            currentDate.getMonth() + 1
          }-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`
        );
        dataForm.append("url", window.location.href);

        insertUser(dataForm).then((res) => {
          if (res.status === "success" && res.data) {
            // let stringData = '';
            // dataForm.forEach(function (value, key) {
            //    stringData += `${key}=${value}&`;
            // });

            let stringData = "";
            for (const property in res.data) {
              stringData += `${property}=${res.data[property]}&`;
            }

            insertUserDrive(stringData).then((resDrive) => {
              let message = document.getElementsByClassName("modal-text");
              message[0].textContent = res.message;

              const myModal = new bootstrap.Modal(
                document.getElementById("thankYouModal")
              );
              myModal.show();

              spinnerForm.classList.add("d-none");
              btnSubmit.removeAttribute("disabled");

              form.classList.remove("was-validated");
              form.reset();
            });
          } else {
            let message = document.getElementsByClassName("modal-text");
            message[0].textContent = res.message;

            const myModal = new bootstrap.Modal(
              document.getElementById("thankYouModal")
            );
            myModal.show();

            spinnerForm.classList.add("d-none");
            btnSubmit.removeAttribute("disabled");
          }
        });
      }
    });
  }
};

async function insertUser(dataForm) {
  const response = await fetch("class/lib.php", {
    method: "POST",
    body: dataForm,
  });
  return response.json();
}

async function insertUserDrive(json) {
  const response = await fetch(
    `https://script.google.com/macros/s/AKfycbxq0V8jur7xMuklQReqPs7niWhZgoJ7-7qYKs4it6JFJ3SSYSTbKxE5MPmqoHHiVTxy8g/exec?${json}`,
    {
      method: "GET",
    }
  );
  return response.json();
}
