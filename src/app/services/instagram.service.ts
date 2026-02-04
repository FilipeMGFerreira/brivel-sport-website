import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { appSettings } from '../appsettings';

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  link: string;
  likes: number;
  timestamp: Date;
  media_type?: string;
  permalink?: string;
}

export interface InstagramApiResponse {
  data: Array<{
    id: string;
    caption?: string;
    media_type: string;
    media_url: string;
    permalink: string;
    timestamp: string;
    like_count?: number;
  }>;
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private readonly APP_ID = appSettings.instagram.appId;
  private INSTAGRAM_USER_ID: string = appSettings.instagram.userId;
  private readonly ACCESS_TOKEN = appSettings.instagram.accessToken;
  private readonly API_BASE_URL = 'https://graph.instagram.com';

  constructor(private http: HttpClient) {}

  getUserId(): Observable<string | null> {
    if (!this.ACCESS_TOKEN) {
      return of(null);
    }

    const params = new HttpParams()
      .set('fields', 'id,username')
      .set('access_token', this.ACCESS_TOKEN);

    return this.http.get<{ id: string; username: string }>(
      `${this.API_BASE_URL}/me`,
      { params }
    ).pipe(
      map(response => {
        // Salva o User ID na propriedade para melhor performance nas próximas chamadas
        this.INSTAGRAM_USER_ID = response.id;
        return response.id;
      }),
      catchError(error => {
        return of(null);
      })
    );
  }

  /**
   * Verifica se o valor é um ID numérico válido
   */
  private isNumericId(value: string): boolean {
    return /^\d+$/.test(value);
  }

  /**
   * Busca os posts mais recentes do Instagram
   * @param limit Número de posts a retornar (máximo 25)
   */
  getRecentPosts(limit: number = 6): Observable<InstagramPost[]> {

    // Validação de credenciais
    if (!this.ACCESS_TOKEN || this.ACCESS_TOKEN.trim() === '') {
      return of([]);
    }

    // Validação do limite
    const validLimit = Math.max(1, Math.min(limit, 25));

    // Se não tiver USER_ID configurado ou se for um username (não numérico), tenta obter automaticamente
    if (!this.INSTAGRAM_USER_ID || !this.isNumericId(this.INSTAGRAM_USER_ID)) {
      return this.getUserId().pipe(
        switchMap(userId => {
          if (!userId) {
            return of([]);
          }
          return this.fetchPostsWithUserId(userId, validLimit);
        }),
        catchError((error) => {
          return of([]);
        })
      );
    }
    return this.fetchPostsWithUserId(this.INSTAGRAM_USER_ID, validLimit);
  }

  /**
   * Busca posts usando um User ID específico
   */
  private fetchPostsWithUserId(userId: string, limit: number): Observable<InstagramPost[]> {
    if (!userId || !this.isNumericId(userId)) {
      return of([]);
    }

    const params = new HttpParams()
      .set('fields', 'id,caption,media_type,media_url,permalink,timestamp,like_count')
      .set('limit', Math.min(limit, 25).toString()) // Limita a 25 (máximo da API)
      .set('access_token', this.ACCESS_TOKEN);

    return this.http.get<InstagramApiResponse>(
      `${this.API_BASE_URL}/${userId}/media`,
      { params }
    ).pipe(
      map(response => {
        if (!response || !response.data) {
          return [];
        }

        const transformedPosts = this.transformPosts(response.data);
        return transformedPosts;
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  /**
   * Transforma os dados da API do Instagram no formato esperado pelo componente
   */
  private transformPosts(posts: InstagramApiResponse['data']): InstagramPost[] {
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return [];
    }

    const validPosts = posts
      .filter(post => {
        // Filtra apenas imagens e carrosséis
        const isValidType = post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM';
        // Valida se tem URL de mídia
        const hasMediaUrl = post.media_url && post.media_url.trim() !== '';
        
        return isValidType && hasMediaUrl;
      })
      .map(post => {
        // Limita o tamanho da caption para melhor performance
        const caption = post.caption || '';
        const truncatedCaption = caption.length > 100 
          ? caption.substring(0, 100) + '...' 
          : caption;

        return {
          id: post.id,
          image: post.media_url,
          caption: truncatedCaption,
          link: post.permalink || `https://www.instagram.com/p/${post.id}/`,
          likes: post.like_count || 0,
          timestamp: new Date(post.timestamp),
          media_type: post.media_type
        };
      })
      .slice(0, 6); 
    return validPosts;
  }

  /**
   * Método alternativo usando Instagram Basic Display API
   * Requer configuração diferente e token de longa duração
   */
  getPostsBasicDisplay(): Observable<InstagramPost[]> {
    // Implementação alternativa se preferir usar Basic Display API
    // Esta API é mais simples mas tem limitações
    return of([]);
  }
}
