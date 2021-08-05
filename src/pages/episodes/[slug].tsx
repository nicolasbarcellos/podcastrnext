import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";

import { usePlayer } from "../../contexts/PlayerContext";

import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";

interface Episode {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: string;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

interface EpisodeProps {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      ></div>
    </div>
  );
}

// ! Método obrigatório sempre que usamos getStaticProps com parâmetros dinâmicos, pois
// ! quando criamos páginas estáticas porém com dados dinâmicos, o next não sabe qual dado
// ! vai ser criado, por isso precisamos usar getStaticPaths
// ! Se eu já passar um dado para o paths, ele já vai ser criado pelo next, agora deixando
// ! vazio, vai ser criado conforme o usuário acessar.
// ! Se eu não passar nenhum dado dentro de paths e fallback for false, vai retornar 404
// ! pois não foi gerado nenhuma página estática
// ! Se o fallback for true e paths vazio, ele vai procurar algum dado para gerar
// ! a página estática, esse dado será gerado pelo lado do client(brownser)
// ! Se fallback for blocking, ele vai procurar o dado a ser gerado de forma estática
// ! dentro da camada do next(getStaticProps)
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(new Date(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};
