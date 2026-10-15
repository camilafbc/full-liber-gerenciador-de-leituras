export function getCleanBookCover(url?: string) {
  if (!url) return "";

  // Transforma http em https
  let cleanUrl = url.replace("http://", "https://");

  // Substitui o zoom pequeno por uma versão maior, se aplicável
  // cleanUrl = cleanUrl.replace("&zoom=1", "&zoom=2");

  // Remove o efeito de página dobrada se estiver presente na query string
  cleanUrl = cleanUrl.replace("&edge=curl", "");

  return cleanUrl;
}
