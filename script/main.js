const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '0c7cf41b4caeae5df491fc6902ebb574';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const pagination = document.querySelector('.pagination');


const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {

    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные с ${url}`);
        }
    }

    getTestData = async () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = query => {
        this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU&query=${query}`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page);
    }

    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=en-US`);
    }

    getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);
    getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);
    getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);
    getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
}

const dbservice = new DBService();

const renderCard = (response, target) => {
    console.log(response);
    tvShowList.textContent = '';


    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
        tvShowsHead.style.cssText = 'color: red';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
    tvShowsHead.style.color = 'green';

    response.results.forEach(item => {

        const { backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.idTV = id;
        card.className = 'tv-shows__item';
        card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
             src="${posterIMG}";
             data-backdrop="${IMG_URL + backdrop}";
             alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
    </a>
    `;
        loading.remove();
        tvShowList.append(card);
    });

    // pagination.textContent = '';

    // if(target && response.total_pages > 1) {
    //     for(let i = 1; i <= response.total_pages; i++) {
    //         pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
    //     }
    // }

};

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();

    if (value) {
        tvShows.append(loading);
        dbservice.getSearchResult(value).then(renderCard);
    }

    searchFormInput.value = '';
});


// Открытие/закрытие меню

const closeDropdown = () => {
    dropdown.forEach((item) => {
        item.classList.remove('active')
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});


document.addEventListener('click', () => {
    const target = event.target;
    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    };
});

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');

    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
        
    }

    if(target.closest('#top-rated')) {
        dbservice.getTopRated().then((response) => renderCard(response, target));
    }

    if(target.closest('#popular')) {
        dbservice.getPopular().then((response) => renderCard(response, target));
    }

    if(target.closest('#week')) {
        dbservice.getWeek().then((response) => renderCard(response, target));
    }

    if(target.closest('#today')) {
        dbservice.getToday().then((response) => renderCard(response, target));
    } 

    if(target.closest('#search')) {
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
    }

});

//Открытие модального окна 

tvShowList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {

        preloader.style.display = 'block';

        dbservice
            .getTvShow(card.id)
            .then(({
                poster_path: posterPath,
                name: title,
                genres,
                vote_average: vote_average,
                overview,
                homepage }) => {

                if (posterPath) {
                        tvCardImg.src = IMG_URL + posterPath,
                        tvCardImg.alt = title;
                        posterWrapper.style.display = '';
                } else {
                    posterWrapper.style.display = 'none'
                }


                modalTitle.textContent = title,
                    genresList.textContent = '';
                genres.forEach(item => {
                    genresList.innerHTML = `<li>${item.name}</li>`
                });
                rating.textContent = vote_average;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
                modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
            })

            .then(() => {
                preloader.style.display = '';
            })
    };
});

// Закрытие 

modal.addEventListener('click', event => {

    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    };
})


//Смена карточки 

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');

        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }

    }
}

tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

// pagination.addEventListener('click', event => {
//     event.preventDefault();
//     const target = event.target;

//     if(target.classList.contains('pages')) {
//         tvShows.append(loading);
//         dbservice.getNextPage(target.textContent).then(renderCard);
//     }
// })
