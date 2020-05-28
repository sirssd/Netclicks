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
        return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
    }

    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=en-US`);
    }
}

const renderCard = response => {
    console.log(response);
    tvShowList.textContent = '';

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
};

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();

    if (value) {
     tvShows.append(loading);
    new DBService().getSearchResult(value).then(renderCard);
    }

    searchFormInput.value = '';
});



// Открытие/закрытие меню

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});


document.body.addEventListener('click', (event) => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    };
});

leftMenu.addEventListener('click', event => {
    const target = event.target;
    const dropdown = target.closest('.dropdown');

    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

//Открытие модального окна 

tvShowList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {

        new DBService()
            .getTvShow(card.id)
            .then(data => {
                console.log(data);
                tvCardImg.src = IMG_URL + data.poster_path;
                modalTitle.textContent = data.name;
                genresList.textContent = '';
                data.genres.forEach(item => {
                    genresList.innerHTML = `<li>${item.name}</li>`
                });
                rating.textContent = data.vote_average;
                description.textContent = data.overview;
                modalLink.href = data.homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
                modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
            });
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


