import { TestBed } from '@angular/core/testing';
import { RequestSongService } from './request-song.service';

describe('RequestSongService', () => {
  let service: RequestSongService;
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestSongService]
    });
    service = TestBed.inject(RequestSongService);
    originalFetch = window.fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reject if title is empty', async () => {
    await expectAsync(
      service.submitSongRequest({ title: '', lyrics: 'Some lyrics' })
    ).toBeRejectedWithError('Song title is required.');
  });

  it('should reject if lyrics are empty', async () => {
    await expectAsync(
      service.submitSongRequest({ title: 'Song Title', lyrics: '   ' })
    ).toBeRejectedWithError('Song lyrics are required.');
  });

  it('should submit payload to endpoint and return success on 200 response', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    window.fetch = jasmine.createSpy('fetch').and.callFake((url: any, init: any) => {
      capturedUrl = url.toString();
      capturedBody = JSON.parse(init.body);
      return Promise.resolve(new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    });

    const res = await service.submitSongRequest({
      title: 'Amazing Grace',
      lyrics: 'Amazing grace how sweet the sound',
      submitterName: 'John',
      submitterEmail: 'john@example.com',
      notes: 'Please add this'
    });

    expect(res.success).toBeTrue();
    expect(capturedUrl).toContain('api.web3forms.com');
    expect(capturedBody.song_title).toBe('Amazing Grace');
    expect(capturedBody.lyrics).toBe('Amazing grace how sweet the sound');
    expect(capturedBody.submitter_name).toBe('John');
    expect(capturedBody.submitter_email).toBe('john@example.com');
  });

  it('should throw error when endpoint returns failure status', async () => {
    window.fetch = jasmine.createSpy('fetch').and.callFake(() => {
      return Promise.resolve(new Response(JSON.stringify({ success: false, message: 'Invalid access key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }));
    });

    await expectAsync(
      service.submitSongRequest({
        title: 'Song Title',
        lyrics: 'Lyrics text'
      })
    ).toBeRejectedWithError('Invalid access key');
  });
});
