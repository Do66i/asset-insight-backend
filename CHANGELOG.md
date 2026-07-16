## 0.0.1 (2026-07-16)


### Bug Fixes

* asset - user module 연결 ([ebf8e67](https://github.com/Do66i/asset-insight-backend/commit/ebf8e673a17eadbc5f1991cb68b9ffe02fde5e60))
* asset 생성 로직 타입 에러 수정 (DTO 구조분해 버그, throwConflict never 타입 명시) ([daeb760](https://github.com/Do66i/asset-insight-backend/commit/daeb760bc3a2078eb7b5051eea887f54fd55fbd6))


### Features

* asset init ([f93ffa4](https://github.com/Do66i/asset-insight-backend/commit/f93ffa42e6a3634d767209af4739e839f6072456))
* User CRUD 전체 구현 완료 (findAll, findOne, update, remove) 및 응답 포맷 통일 ([294aa22](https://github.com/Do66i/asset-insight-backend/commit/294aa22d742e1094019ca91047d5eee76a45f8b0))
* 비밀번호 bcrypt 해싱 적용 및 응답에서 password 필드 제외 ([2e311fc](https://github.com/Do66i/asset-insight-backend/commit/2e311fc7b6474e0cd342112f3a7a423cd175e64c))
* 완료 및 중복 가입 예외 처리(409) 응답 포맷 커스텀 반영 ([85a3617](https://github.com/Do66i/asset-insight-backend/commit/85a36178050ad14d7b644db4c15547a97e587f07))
* 유저 회원가입 기초 뼈대 구축 및 전역 로깅 인프라 세팅 ([2761198](https://github.com/Do66i/asset-insight-backend/commit/27611981e44275cb6864373e1c25b8eb2e509d43))
* * Asset 종목 모델 리팩토링 및 Jest 단위 테스트 추가 ([a5c1d0c](https://github.com/Do66i/asset-insight-backend/commit/a5c1d0c6127e005f42540b4cdd5407ea9524b83b))
