document.addEventListener("DOMContentLoaded", function () {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    "https://youtube.googleapis.com/youtube/v3/channels?part=id%2Csnippet%2CbrandingSettings%2CcontentDetails&id=UCdjkAjBwL8u8VA7aVssXRbg&key=[TU API AQUI]",
    requestOptions
  )
    .then((response) => response.json())
    .then((channelData) => {
      console.log("Detalles del Canal:", channelData);

      if (channelData.items && channelData.items.length > 0) {
        const tituloCanal = channelData.items[0].snippet.title;
        document.getElementById("tituloCanal").innerText = tituloCanal;

        const playlistId =
          channelData.items[0].contentDetails.relatedPlaylists.uploads;
        const playlistUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet%2CcontentDetails&playlistId=${playlistId}&maxResults=50&key=[TU API AQUI]`;

        let paginaActual = 1;
        const videosPorPagina = 10;

        const obtenerVideosPorPagina = (videos, pagina) => {
          const indiceInicio = (pagina - 1) * videosPorPagina;
          const indiceFinal = indiceInicio + videosPorPagina;
          return videos.slice(indiceInicio, indiceFinal);
        };

        const obtenerTodosLosVideos = (url, totalVideos = []) => {
          fetch(url, requestOptions)
            .then((response) => response.json())
            .then((playlistData) => {
              console.log("Elementos de la Lista de Reproducción:", playlistData);

              if (playlistData.items && playlistData.items.length > 0) {
                totalVideos.push(...playlistData.items);
              }

              if (playlistData.nextPageToken) {
                const nextPageUrl = `${playlistUrl}&pageToken=${playlistData.nextPageToken}`;
                obtenerTodosLosVideos(nextPageUrl, totalVideos);
              } else {
                const videosFiltrados = totalVideos.filter((video) => {
                  const fechaPublicacion = new Date(
                    video.snippet.publishedAt
                  ).getFullYear();
                  return fechaPublicacion === 2023;
                });

                videosFiltrados.sort((videoA, videoB) => {
                  const fechaA = new Date(videoA.snippet.publishedAt);
                  const fechaB = new Date(videoB.snippet.publishedAt);
                  return fechaA - fechaB;
                });

                const listaReproduccion = document.getElementById("resultado");

                const mostrarVideosPagina = (videos) => {
                  listaReproduccion.innerHTML = '';

                  const videosMostrar = obtenerVideosPorPagina(videos, paginaActual);

                  videosMostrar.forEach((video) => {
                    const titulo = video.snippet.title;
                    const videoId = video.contentDetails.videoId;
                    const fechaPublicacion = new Date(
                      video.snippet.publishedAt
                    ).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

                    const elementoVideo = document.createElement("div");
                    elementoVideo.classList.add("video-card");
                    elementoVideo.innerHTML = `
                      <h3>${titulo}</h3>
                      <p>${fechaPublicacion}</p>
                      <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    `;

                    listaReproduccion.appendChild(elementoVideo);
                  });
                };

                mostrarVideosPagina(videosFiltrados);
                
                const mostrarPaginacion = (totalVideos) => {
                  const paginacion = document.getElementById("paginacion");
                  paginacion.innerHTML = '';

                  const totalPaginas = Math.ceil(totalVideos.length / videosPorPagina);

                  for (let i = 1; i <= totalPaginas; i++) {
                    const botonPagina = document.createElement("button");
                    botonPagina.innerText = i;
                    botonPagina.addEventListener('click', () => {
                      paginaActual = i;
                      mostrarVideosPagina(videosFiltrados);
                    });
                    paginacion.appendChild(botonPagina);
                  }
                };

                mostrarPaginacion(videosFiltrados);
              }
            })
            .catch((error) =>
              console.log(
                "Error al obtener elementos de la lista de reproducción:",
                error
              )
            );
        };

        obtenerTodosLosVideos(playlistUrl);
      } else {
        console.log("No se encontraron detalles del canal.");
      }
    })
    .catch((error) =>
      console.log("Error al obtener detalles del canal:", error)
    );
});
